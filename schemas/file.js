const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    sender: mongoose.Schema.ObjectId,
    title: mongoose.Schema.ObjectId,
    address: {
        type: String,
        required: true
    },
    size: Number,
    uploadedAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('FileModel', fileSchema);