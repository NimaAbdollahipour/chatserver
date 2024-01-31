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

module.exports = mongoose.model('FileModel', fileSchema);