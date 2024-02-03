const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    sender: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    size: Number,
    uploadedAt: {
        type: Date,
        default: new Date()
    },
    fileType: {
        type: String,
        required: true
    }
})
const FileModel = mongoose.model('FileModel', fileSchema);
module.exports = {FileModel, fileSchema}