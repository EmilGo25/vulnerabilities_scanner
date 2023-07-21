const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const axios = require('axios');
const {create} = require("axios");
require('dotenv').config()
const apiSecret=process.env.API_SECRET
let inMemoryToken = null;
const createToken = async ()=>{
    const tokenRes= await axios.post(process.env.CREATE_TOKEN_URL,{"apiKey":apiSecret});
    inMemoryToken=tokenRes.data;
    return tokenRes.data;
}

const getToken = async ()=>{
    if(inMemoryToken){
        return inMemoryToken;
    }

    const tokenRes= await createToken();
    inMemoryToken=tokenRes;
    return tokenRes;
}

const getVulnerabilities = async ()=> {
    const vulnerabilities=[];
    const vulnerabilitiesPageSize=10;
    let vulnerabilitiesPage=1;

    while(true){
        const vulnerabilitiesRes= await axios.get(`${process.env.VULNERABILITIES_URL}?page=${vulnerabilitiesPage}&size=${vulnerabilitiesPageSize}`,{headers:{'Authorization':`Bearer ${inMemoryToken}`}});
        const vulnerabilitiesArr= vulnerabilitiesRes.data || []
        if(vulnerabilitiesArr.length===0){
            break;
        }
        vulnerabilities.push(...vulnerabilitiesArr)
        vulnerabilitiesPage++;
    }
    return vulnerabilities;
}

app.get('/vulnerabilities',async (req,res)=>{
    if(!inMemoryToken){
        res.status(401).send('Unauthorized')
    }else{
        const vulnerabilities=await getVulnerabilities();

            res.send(vulnerabilities)
    }
})

app.get('/vulnerabilities/endpoint',async (req,res)=>{
    if(!inMemoryToken){
        res.status(401).send('Unauthorized')
    }else{
        const vulnerabilities=await getVulnerabilities();
        const endpointVuls={}
        vulnerabilities.forEach(vulnerabilityItem=>{
            const endpointId=vulnerabilityItem.endpoint_id;
            const endpointCVE=vulnerabilityItem.CVE
            if(endpointCVE){
                if(!endpointVuls[endpointId]){
                    endpointVuls[endpointId]=[endpointCVE]
                }else{
                    endpointVuls[endpointId].push(endpointCVE)
                }
            }
        })

        const result= Object.keys(endpointVuls).map(endpointID=>{
            return {
                ip:endpointID,
                vulnerabilities:endpointVuls[endpointID]
            }
        })

        res.send(result)
    }
})



app.post('/login',async (req,res)=>{
  const token=await getToken();
  res.send(token)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})