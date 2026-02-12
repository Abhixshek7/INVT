const { exec } = require('child_process');
const path = require('path');

exports.getForecast = (req, res) => {
    const days = req.query.days || 30;
    const scriptPath = path.join(__dirname, '../../ml/inference.py');

    // Command to run python script
    // Ensure 'python' is in path, or use a specific env path if configured
    const command = `python "${scriptPath}" ${days}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing forecast script: ${error}`);
            // Check if it's a missing library error
            if (stderr.includes("ModuleNotFoundError")) {
                return res.status(500).json({ error: "ML dependencies missing. Please install requirements." });
            }
            return res.status(500).json({ error: "Failed to generate forecast" });
        }

        try {
            const data = JSON.parse(stdout);
            if (data.error) {
                return res.status(500).json({ error: data.error });
            }
            res.json(data);
        } catch (parseError) {
            console.error(`Error parsing output: ${parseError}`);
            console.error(`Stdout: ${stdout}`);
            console.error(`Stderr: ${stderr}`);
            res.status(500).json({ error: "Invalid response from ML model" });
        }
    });
};

exports.trainModel = (req, res) => {
    const scriptPath = path.join(__dirname, '../../ml/training.py');
    const command = `python "${scriptPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing training script: ${error}`);
            return res.status(500).json({ error: "Training failed" });
        }
        console.log(`Training Output: ${stdout}`);
        res.json({ message: "Training completed", output: stdout });
    });
};
