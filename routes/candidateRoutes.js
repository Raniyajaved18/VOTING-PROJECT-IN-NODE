const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const candidate = require('../models/candidate');


const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userID);
        if (user.role === 'admin') {
            return true;
        }
    } catch (err) {
        return false;  
    }
}

//POST route to add a candidate
router.post('/', jwtAuthMiddleware, async(req,res) => {
    try {
        if (!(await checkAdminRole(req.user.id)))
            return res.status(403).json({ message: 'user does not have admin role' });

        const data = req.body // Assuming the request body contains the candidate date

        // create a new user document using the mongoose model 
        const newCandidate = new Candidate(data);

        //save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({ response: response });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server Error' });
        }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role' });
        
        const candidateID = req.params.candidateID; // Extract the id from URL parameter
        const updatedCandidateData = req.body; //update data for the person

        const response = await Candidate.findByAndUpdate(candidateID, updatedCandidateData, {
            new: true, // return the updated document
            runValidators: true, // Run mongoose Validation
        })

        if (!response) {
            return res.status(404).json({ error: ' candidate not found' });
        }
        
        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server Error' });
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user does not have admin role ' });

        const candidateID = req.params.candidateID.candidateID; //extract the id from the url parameter

        const response = await Candidate.findByIDAndDelete(candidateID);

        if (!response) {
            return res.status(404).json({ error: 'cnadidate not found' });
        }

        console.log('candidate deleted');
        res.status(200).json(response);
    }catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server Error' });
    }
})

//let's start voting
router.get('//:candidateID', jwtAuthMiddleware, async (req, res) => {
    //only user can vote and also admin is not allowed to vote

    candidateID = req.params.candidateID;
    userID = req.user.id;

    try {
        //find the candidate document with the specified candidateID
        const candidate = await Candidate.findByID(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' });
        }

        const user = await user.findByID(userID);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        if (user.role == 'admin') {
            return res.status(403).json({ message: ' admin is not allowed' });
        }
        if (user.isvoted) {
            return res.status(400).json({ message: 'you have already voted' });
        }

        // update the candidate document to record the vote
        candidate.vote.push({ user: userID })
        candidate.votecount++;
        await candidate.save();

        // update the user document
        user.isvoted = true
        await user.save();

        return res.status(200).json({ message: ' vote recorded successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//vote count
router.get('/vote/count', async (req, res) => {
    try {
        //find all candidates and sort them by votecount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // map the candidates to only return their name and votecount
        const voteRecord = candidate.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });

    }
});

// get list os all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // return the list of candidates
        res.status(200).json(candidates);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
               
    }
});
module.exports = router;