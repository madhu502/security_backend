const { AppError } = require('../middleware/ErrorHandler');
const { MongoClient } = require('mongodb');

exports.getLogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const client = await MongoClient.connect(process.env.MONGODB_URI);
        const db = client.db();
        const collection = db.collection('logs');

        const [logs, total] = await Promise.all([
            collection.find({})
                .sort({ time: -1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments()
        ]);

        await client.close();

        res.status(200).json({
            status: 'success',
            results: logs.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: logs
        });
    } catch (error) {
        next(new AppError('Error fetching logs', 500));
    }
}; 