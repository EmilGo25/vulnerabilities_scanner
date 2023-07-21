const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const axios = require('axios');
const {create} = require("axios");
const apiSecret='157Xl9eY15gg15zXoNeVINeR16HXmden16jXmNeZ150sINeQ15TXkdeq15k='
let inMemoryToken = null;
const createToken = async ()=>{
    const tokenRes= await axios.post('http://74.234.252.116:8000/api/token/create',{"apiKey":apiSecret});
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
        const vulnerabilitiesRes= await axios.get(`http://74.234.252.116:8000/api/vulnerabilities?page=${vulnerabilitiesPage}&size=${vulnerabilitiesPageSize}`,{headers:{'Authorization':`Bearer ${inMemoryToken}`}});
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



app.post('/login',async (req,res)=>{
  const token=await getToken();
  res.send(token)
})

app.get('/api-json',(req,res)=>{
    const apiJsonRes= axios.get('http://74.234.252.116:8000/api-json').then(res=>{
        console.log('res.data',res.data)
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})