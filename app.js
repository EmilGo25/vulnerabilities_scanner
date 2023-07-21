const express = require('express')
const app = express()
app.use(express.json())
const port = 3000
const axios = require('axios');
const {create} = require("axios");
const apiSecret='157Xl9eY15gg15zXoNeVINeR16HXmden16jXmNeZ150sINeQ15TXkdeq15k='
const createToken = async ()=>{
    const tokenRes= await axios.post('http://74.234.252.116:8000/api/token/create',{"apiKey":apiSecret});
    return tokenRes.data;
}

app.post('/token',async (req,res)=>{
  const token=await createToken();
})

app.get('/api-json',(req,res)=>{
    const apiJsonRes= axios.get('http://74.234.252.116:8000/api-json').then(res=>{
        console.log('res.data',res.data)
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})