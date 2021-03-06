const { ENGINE_METHOD_NONE } = require("constants");
const express = require("express")
const mongodb = require("mongodb")

const app = express();
const port = process.env.PORT || 3000;
const mongoClient = mongodb.MongoClient;
const object_id = mongodb.ObjectID;
const mongodb_url = "mongodb://127.0.0.1:27017/";

app.use(express.json());

app.post("/create_mentor", async (req, res)=>{
    let data = req.body;
    if(Object.keys(data).length == 0)
        return res.status(400).json({"detail": "Invalid Body Request"})
    let client  = await mongoClient.connect(mongodb_url);
    let collection = client.db("guvi_DailyTask(DT)_11-21-2020").collection('mentors');
    let response = await collection.insertOne(data);
    client.close();
    if(response['insertedCount'] == 1)
        return res.status(200).json({"detail":`record inserted`, "id":response["ops"][0]["_id"]})
    else
        return res.status(500).json({"detail": "Some Error Occured"})
})

app.post("/create_student", async (req, res)=>{
    let data = req.body;
    if(Object.keys(data).length == 0)
        return res.status(400).json({"detail": "Invalid Body Request"})
    let client  = await mongoClient.connect(mongodb_url);
    let collection = client.db("guvi_DailyTask(DT)_11-21-2020").collection('students');
    let response = await collection.insertOne(data);
    client.close();
    if(response['insertedCount'] == 1)
        return res.status(200).json({"detail":`record inserted`, "id":response["ops"][0]["_id"]})
    else
        return res.status(500).json({"detail": "Some Error Occured"})
})

app.post("/assigne_students_mentor", async (req, res)=>{
    let mentor_id = req.body['mentor_id'];
    let student_ids = req.body["student_ids"];
    if(!mentor_id && !student_ids)
        return res.status(400).json({"detail": "Invalid Body Request"});
    let client  = await mongoClient.connect(mongodb_url);
    let collection = client.db("guvi_DailyTask(DT)_11-21-2020").collection('mentor_student_relationship');
    let data = student_ids.map((student)=>{return {'mentor_id':object_id(mentor_id), "student_id":object_id(student)}});
    let response = await collection.insertMany(data);
    console.log(response);
    client.close();
    if(response['insertedCount'] >= 1)
        return res.status(200).json({"detail":`Mapped Successful`, "ids":response["insertedIds"]})
    else
        return res.status(500).json({"detail": "Some Error Occured"})
})

app.put("/change_mentor/:student_id", async (req, res)=>{
    let mentor_id = req.body['mentor_id'];
    let student_id = req.params["student_id"];
    if(!mentor_id)
        return res.status(400).json({"detail": "Invalid Body Request"});
    let client  = await mongoClient.connect(mongodb_url);
    let collection = client.db("guvi_DailyTask(DT)_11-21-2020").collection('mentor_student_relationship');
    let response = await collection.findOneAndUpdate({"student_id": object_id(student_id)},{$set: {"mentor_id": object_id(mentor_id)}});
    console.log(response);
    client.close();
    if(response['ok'])
        return res.status(200).json({"detail":`Mapped Successful`, "ids":response["insertedIds"]})
    else
        return res.status(500).json({"detail": "Some Error Occured"})
})

app.get("/get_students/:mentor_id", async (req, res)=>{
    let student_id = req.params["student_id"];
    let client  = await mongoClient.connect(mongodb_url);
    let collection = client.db("guvi_DailyTask(DT)_11-21-2020").collection('mentor_student_relationship');
    let result = await collection.find({"mentor_id":student_id}).toArray();
    res.status(200).json({result})
})

app.listen(port, ()=>console.log("Server Started on Port "+port));