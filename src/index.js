import app from './app.js';

const PORT = process.env.PORT || 4001;

console.log("hello")

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
