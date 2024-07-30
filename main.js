const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for async/await
const { autoUpdater, appUpdater } = require('electron-updater');

//Basic flags
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

let directoryPath2 = '';

// Create the main application window
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 550,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Recommended for security
            nodeIntegration: false,
            enableRemoteModule: false,
            sandbox: true
        },
        autoHideMenuBar: true,
        icon: path.join('image/favicon.ico'),
        fullscreenable: false,
        fullscreen: false
    });

    mainWindow.loadFile('index.html');

    // Open a dialog to select a folder
    dialog.showOpenDialog(mainWindow, {
        title: 'Select Gorilla Tag Installation',
        properties: ['openDirectory']
    }).then(async result => {
        if (result.canceled) {
            console.log('No folder selected');
            return;
        }

        const selectedDirectory = result.filePaths[0];
        directoryPath2 = path.join(selectedDirectory, 'BepInEx', 'Plugins');
        console.log('Selected folder:', selectedDirectory);
        console.log('Directory path 2:', directoryPath2);

        try {
            // Write the directory path to a file
            await fs.writeFile('prefGD.txt', directoryPath2, 'utf8');
            console.log('File written successfully');

            // Send the selected directory to the renderer process
            mainWindow.webContents.send('selected-directory', selectedDirectory);

            // Save folders to file
            await saveFoldersToFile();
        } catch (err) {
            console.error('Error handling files:', err);
        }
    }).catch(err => {
        console.error('Error opening directory dialog:', err);
    });
}

// List folders in a directory
async function listFolders(dirPath) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        return files.filter(file => file.isDirectory()).map(folder => folder.name);
    } catch (err) {
        console.error(`Error reading directory "${dirPath}":`, err.message);
        return [];
    }
}

// Save folder names to a file
async function saveFoldersToFile() {
    if (!directoryPath2) {
        console.log('No directory path set.');
        return;
    }

    try {
        // Check if directoryPath2 exists and list its folders if it does
        if (await fs.stat(directoryPath2).catch(() => false)) {
            const folders = await listFolders(directoryPath2);
            const folderString = folders.join(', ');

            await fs.writeFile(path.join(__dirname, 'folderNames.txt'), folderString);
            console.log('Folder names saved to folderNames.txt');
        } else {
            console.log(`${directoryPath2} does not exist, skipping.`);
        }
    } catch (error) {
        console.error('Error processing folders:', error);
    }
}

// Set up app lifecycle
app.whenReady().then(() => {
    createWindow();

    autoUpdater.checkForUpdates();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

