import server from './src';
const port = process.env.PORT || 8000;
server.listen(port, () => {
    console.log(`server started on port ${port}`);
});