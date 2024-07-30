const fs = require('fs');
const path = require('path');

const pathy = "C:/Program Files (x86)/Steam/steamapps/common/Gorilla Tag";
const pathy2 = "C:/Program Files/Oculus/Software/Software/another-axiom-gorilla-tag";
const directoryPath = path.join(pathy, 'BepInEx', 'Plugins');
const directoryPath2 = path.join(pathy2, 'BepInEx', 'Plugins');
const outputPath = path.join(__dirname, 'folderNames.txt');

function listFolders(dirPath, callback) {
    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            callback([]);
            return;
        }
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        callback(folders);
    });
}

function saveFoldersToFile() {
    listFolders(directoryPath, (folders1) => {
        listFolders(directoryPath2, (folders2) => {

            const allFolders = [...folders1, ...folders2];

            const folderString = allFolders.join(', ');

            fs.writeFile(outputPath, folderString, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('Folder names saved to', outputPath);
                }
            });
        });
    });
}

saveFoldersToFile();