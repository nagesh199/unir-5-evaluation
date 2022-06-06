const express = require("express");
const fs = require("fs");
const app = express()

app.use(express.urlencoded({extended:true}));
app.use(express.json());

function validation (req,res,next){
    if(req.url==='/user/login'){
        fs.readFile('./db.json','utf-8',(err,data) => {
           const parsed = JSON.parse(data);
           let user = parsed.users.filter((user) => 
           user.email == req.body.email && user.password == req.body.password
           )
           console.log(user);

           if(user.length !== 0) next();
           else res.status(401).send({status: "Invalid Credentials" })
        })
    }
   next()
}
app.post("/user/create",(req,res)=>{
    fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
        const parsed = JSON.parse(data);
        const id = Math.random()*10
        const newUsers ={id:id,...req.body}
        parsed.users = [...parsed.users,newUsers];

        fs.writeFile("./db.json",JSON.stringify(parsed),
        {encoding:"utf-8"},()=>{
            res.status(201).send("user created");
            return {
                status:"user created",
                id:id
            }
        })
    })
})

app.post("/user/login",validation,(req,res)=>{
    fs.readFile("./db.json",{encoding:"utf-8"},(err,data)=>{
        const parsed = JSON.parse(data);
        parsed.users = [...parsed.users,req.body];

        fs.writeFile("./db.json",JSON.stringify(parsed),
        {encoding:"utf-8"},(err,data)=>{
            res.send(data)
        })
    })
})

app.get("/votes/party/:party",(req,res)=>{
    const {party} =  req.params

    fs.readFile("./db.json", {encoding:"utf-8"}, (err,data) => {
       
        const parsed = JSON.parse(data)

        parsed.users = parsed.users.filter(el => el.party==party)
        parsed.users = [...parsed.users,req.body]

        res.end(JSON.stringify(parsed))
    })
})

app.get("/votes/voters",(req,res)=>{
    fs.readFile("./db.json",{encoding:"utf-8"},(err,data=>{
        const parsed = JSON.parse(data);
 
        parsed.users = parsed.users.filter((id)=>id.role=== "voter");
        parsed.users = [...parsed.users,req.body]
        res.end(JSON.stringify(parsed))
     }))
})
app.get("votes/count/:user",(req,res)=>{
    const name = req.params.user

    fs.readFile('./db.json',{encoding:"utf-8"},(err,data) => {
        const parsed = JSON.parse(data);
       
    
        const user = parsed.users.find((user) => {
          return  user.name === name
    })
        const {votes} = user;
        res.send({
            status : votes,
            status : 'cannot find user'
        })
    })
})

const PORT = process.env.PORT || 8080
app.listen(8080,()=>{
   console.log("Server started on http://localhost:8080")
})
