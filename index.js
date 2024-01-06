const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const  jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const cors = require('cors');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tort7uo.mongodb.net/?retryWrites=true&w=majority`;
const stripe= require('stripe')('sk_test_51NtCtrF2ejzpUbVI0D61WSBe8TSrr08Hvibewlcu8LLfAHrmOjV8aXmPT2FXbfhMMgSzO4y2wV461Nk1A25EJ12T000CuL1UR1');
app.use(cors())
app.use(express.json())
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: true, message: 'unauthorized access' })
      }
      req.decoded = decoded;
      next();
    })
  }


async function run() {
  
    try {
      const paymentCollection = client.db('library').collection('payments');
      const reviewCollection = client.db('library').collection('reviews');
      const bookCollection = client.db('library').collection('allbook');
      const userCollection = client.db('library').collection('user');
      const fictionCollection = client.db('library').collection('fiction');
      const nonfictionCollection = client.db('library').collection('nonfiction');
      const biographyCollection = client.db('library').collection('biography');
      const bestbiographyCollection = client.db('library').collection('bestsellerbiography');
      const bestfictionCollection = client.db('library').collection('bestsellerfiction');
      const bestnonfictionCollection = client.db('library').collection('bestnonfiction');
      const kidsCollection = client.db('library').collection('kids');
      const bestkidsCollection = client.db('library').collection('bestsellerkids');
      const novelCollection = client.db('library').collection('novel');
      const bestnovelCollection = client.db('library').collection('bestnovel');
      // Connect the client to the server	(optional starting in v4.7)
      app.post('/payments',async(req,res)=>{
        const payment=req.body;
        console.log('uaaauuuu',payment)
        const result=await paymentCollection.insertOne(payment)
        res.send(result)
      })
      const verifyAdmin=async(req,res,next)=>{
        const email = req.decoded.email;
        const query={email:email}
        const user = await userCollection.findOne(query);
        if(user?.role!=='admin'){
         return res.status(403).send({error:true,message:'forbidden message'})
        }
        next()
     }
    
     app.get('/orders/:email', async (req, res) => {
      try {
          const userEmail = req.params.email;
          const query = { user: userEmail };
          console.log('user mail', query)
  
          // Use toArray to convert the cursor to an array
          const transactions = await paymentCollection.find(query).toArray();
  
          if (transactions.length > 0) {
              res.json(transactions);
              console.log(transactions);
          } else {
              res.status(404).json({ error: 'User not found' });
          }
      } catch (error) {
          console.error('Error fetching user history', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });
  app.get('/search',async (req, res) => {
    const { query } = req.query;
    console.log(query)
  
    if (!query) {
      return res.status(400).json({ error: 'Invalid search query' });
    }
  
    // Perform a simple case-insensitive search on book titles
    const searchResults = await bookCollection.find({ name: { $regex: new RegExp(query, 'i') } }).toArray();
    console.log(searchResults)
  
    res.json(searchResults);
  });
  
  app.get('/allorder', async (req, res) => {
    try {
        
        const query = {};
        console.log('user mail', query)

        // Use toArray to convert the cursor to an array
        const transactions = await paymentCollection.find(query).toArray();

        if (transactions.length > 0) {
            res.json(transactions);
            console.log(transactions);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user history', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
    
    app.get('/order/:email/:bfid', async (req, res) => {
      try {
          const userEmail = req.params.email;
          const id = req.params.bfid;
          console.log(userEmail,id,'dfdvlcnvcvlc')
          const query = { user: userEmail, id: id };
          const transaction = await paymentCollection.findOne(query);
  
          if (transaction) {
              // Include the payment status in the response
              const response = {
                  ...transaction,
                  paymentStatus: transaction.status,
              };
  
              res.json(response);
              console.log(response);
          } else {
              res.status(404).json({ error: 'User not found or no transaction found' });
          }
      } catch (error) {
          console.error('Error fetching user history', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });
  
      app.get('/fiction', async (req, res) => {
        const query = {}
        const blogs = await fictionCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/nonfiction', async (req, res) => {
        const query = {}
        const blogs = await nonfictionCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/bestfiction', async (req, res) => {
        const query = {}
        const blogs = await bestfictionCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/bestnonfiction', async (req, res) => {
        const query = {}
        const blogs = await bestnonfictionCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/kids', async (req, res) => {
        const query = {}
        const blogs = await kidsCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/biography', async (req, res) => {
        const query = {}
        const blogs = await biographyCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/novel', async (req, res) => {
        const query = {}
        const blogs = await novelCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/bestnovel', async (req, res) => {
        const query = {}
        const blogs = await bestnovelCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/bestkids', async (req, res) => {
        const query = {}
        const blogs = await bestkidsCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.get('/bestbiography', async (req, res) => {
        const query = {}
        const blogs = await bestbiographyCollection.find(query).toArray();
        console.log(blogs)
        res.send(blogs);
      })
      app.post('/users', async (req, res) => {
        const user = req.body;
        const query={email:user.email}
        const existingUser= await userCollection.findOne(query)
        if(existingUser){
          return res.send({message: 'user already exists'})
        }
        console.log(user)
        const result = await userCollection.insertOne(user)
        res.send(result);
      })
      app.get('/users',verifyJWT,verifyAdmin,async(req,res)=>{
        const query={}
        const users=await userCollection.find(query).toArray();
        console.log(users)
        res.send(users)
      })
      app.get('/users/admin/:email',verifyJWT,async(req,res)=>{
        const email =req.params.email;
        const decodedEmail=req.decoded.email;
        if(email!=decodedEmail){
          res.send({admin:false})
        }
        const query ={email: email}
        const user= await userCollection.findOne(query);
        const result={admin: user?.role==='admin'}
        res.send(result)
        
      })
      app.patch('/users/admin/:id',async(req,res)=>{
        const id =req.params.id;
       console.log(id)
        const filter= {_id: new ObjectId(id)}
        const updateDoc={
          $set:{
            role:'admin'
          },
        };
        const result = await userCollection.updateOne(filter,updateDoc);
        res.send(result)
      })
 
      // app.get('/users', async (req, res) => {
      //   try {
      //     const query = {};
      //     const usersCursor = await userCollection.find(query);
      //     const usersArray = await usersCursor.toArray();
      
      //     console.log(usersArray);
      //     res.send(usersArray);
      //   } catch (error) {
      //     console.error('Error:', error);
      //     res.status(500).send('Internal Server Error');
      //   }
      // });
      
      app.post('/reviews', async (req, res) => {
        const review = req.body;
        console.log(review)
        const result= await reviewCollection.insertOne(review)
        res.send(result);
  
        // try {
        //   const newReview = new Review({ rating, reviewMessage });
         
        //   res.json({ success: true });
        // } catch (error) {
        //   console.error(error);
        //   res.status(500).json({ message: 'Error submitting review' });
        // }
      });
      app.get('/reviews',async(req,res)=>{
        try{
          const result= await reviewCollection.find().limit(3).toArray();
          res.send(result)
        }
        
        catch (error) {
          res.status(500).send('Error fetching reviews');
        }
      })
      app.get('/fiction/:fid', async (req, res) => {
        const id = req.params.fid;
        console.log(id); // Check the value of id
  
        try {
          const fiction= await fictionCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!fiction) {
            return res.status(404).json({ error: 'fictionnot found' });
          }
  
          console.log(fiction);
          res.json(fiction);
        } catch (error) {
          console.error('Error fetching fiction:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/nonfiction/:nid', async (req, res) => {
        const id = req.params.nid;
        console.log(id); // Check the value of id
  
        try {
          const nonfiction= await nonfictionCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!nonfiction) {
            return res.status(404).json({ error: 'fictionnot found' });
          }
  
          console.log(nonfiction);
          res.json(nonfiction);
        } catch (error) {
          console.error('Error fetching nonfiction:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/novel/:nlid', async (req, res) => {
        const id = req.params.nlid;
        console.log(id); // Check the value of id
  
        try {
          const novel= await novelCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!novel) {
            return res.status(404).json({ error: 'novel found' });
          }
  
          console.log(novel);
          res.json(novel);
        } catch (error) {
          console.error('Error fetching novel:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/biography/:bid', async (req, res) => {
        const id = req.params.bid;
        console.log(id); // Check the value of id
  
        try {
          const biography= await biographyCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!biography) {
            return res.status(404).json({ error: 'biographyfound' });
          }
  
          console.log(biography);
          res.json(biography);
        } catch (error) {
          console.error('Error fetching biography:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/kids/:kid', async (req, res) => {
        const id = req.params.kid;
        console.log(id); // Check the value of id
  
        try {
          const kids= await kidsCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!kids) {
            return res.status(404).json({ error: 'fkids found' });
          }
  
          console.log(kids);
          res.json(kids);
        } catch (error) {
          console.error('Error fetching kids:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/bestfiction/:bfid', async (req, res) => {
        const id = req.params.bfid;
        console.log(id); // Check the value of id
  
        try {
          const fiction= await bestfictionCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!fiction) {
            return res.status(404).json({ error: 'fictionnot found' });
          }
  
          console.log(fiction);
          res.json(fiction);
        } catch (error) {
          console.error('Error fetching fiction:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/bestnonfiction/:nfid', async (req, res) => {
        const id = req.params.nfid;
        console.log(id); // Check the value of id
  
        try {
          const nonfiction= await bestnonfictionCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!nonfiction) {
            return res.status(404).json({ error: 'nonnnfictionnot found' });
          }
  
          console.log(nonfiction);
          res.json(nonfiction);
        } catch (error) {
          console.error('Error fetching nonfiction:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/bestbiography/:bbid', async (req, res) => {
        const id = req.params.bbid;
        console.log(id); // Check the value of id
  
        try {
          const biography= await bestbiographyCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
  
          if (!biography) {
            return res.status(404).json({ error: 'fictionnot found' });
          }
  
          console.log(biography);
          res.json(biography);
        } catch (error) {
          console.error('Error fetching biography:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/bestkids/:bkid', async (req, res) => {
        const id = req.params.bkid;
        console.log(id,'hey'); // Check the value of id
  
        try {
          const kids= await bestkidsCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
            console.log('kidsss',kids)
          if (!kids) {
            return res.status(404).json({ error: 'fictionnot found' });
          }
  
          console.log(kids);
          res.json(kids);
        } catch (error) {
          console.error('Error fetching kids:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/bestnovel/:bnlbid', async (req, res) => {
        const id = req.params.bnlbid;
        console.log(id,'hey'); // Check the value of id
  
        try {
          const novel= await bestnovelCollection.findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
            console.log('kidsss',novel)
          if (!novel) {
            return res.status(404).json({ error: 'novel found' });
          }
  
          console.log(novel);
          res.json(novel);
        } catch (error) {
          console.error('Error fetching novel:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      });
      app.get('/admin-stats', async (req, res) => {
        try {
            const fictionCount = await fictionCollection.estimatedDocumentCount();
            const nonfictionCount = await nonfictionCollection.estimatedDocumentCount();
            const kidsCount = await kidsCollection.estimatedDocumentCount();
            const novelCount = await novelCollection.estimatedDocumentCount();
            const biographyCount = await biographyCollection.estimatedDocumentCount();
    
            res.send({
                fictionCollection: fictionCount,
                nonfictionCollection: nonfictionCount,
                novelCollection: novelCount,
                kidsCollection: kidsCount,
                biographyCollection: biographyCount
            });
        } catch (error) {
            console.error('Error fetching collection counts', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
     

    } finally {
      // Ensures that the client will close when you finish/error
    
    }
  }
  run().catch(console.log)

  
  app.post('/jwt',(req,res)=>{
    const user=req.body;
    const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '5h'})
    res.send({token})
  })
  
  

  
  
app.get('/',(req,res)=>{
    res.send('Users Management server is running')
})

app.post('/create-payment-intent',verifyJWT,async(req,res)=>{
  const {totalPrice,name, fid}=req.body;
  const amount= totalPrice*100;
  const email=name;

  console.log(totalPrice,name)
  const paymentIntent= await stripe.paymentIntents.create({
    amount: amount,
    currency:'usd'  ,
    payment_method_types: ['card']
   
  })
  res.send({
      clientSecret: paymentIntent.client_secret
  })
})



app.listen(port,()=>{
    console.log(`server is running on PORT: ${port}`)
})