import app from './app';

app.listen(
  process.env.PORT,
  () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${process.env.PORT}`);
  }
);