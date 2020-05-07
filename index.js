const app = require('express')();
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const postRotues = require('./routes/post');

const PORT = process.env.PORT || 5000;

app.use(require('express').json());
app.use('/api/user', authRoutes);
app.use('/api/post', postRotues);

mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('Connected To Database'))
.catch(err => console.log(`Could not connect to database ${err}`));

app.listen(PORT, () => console.log(`Server is running on localhost:${PORT}`));