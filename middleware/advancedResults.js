const advancedResults = (model, populate) => async (req, res, next) => {
    let query 
    // Copy req.query
    let reqQuery = {...req.query}
    
    // Fields to exclude
    const removeFields = ['select', 'sort','page','limit']

    // Loop over remove Fields, delete them from req.query
    removeFields.forEach(param => {
        delete reqQuery[param]
    })

    // Create query string
    let queryStr = JSON.stringify(reqQuery)

    // Create operators ($gt, $gte, ...etc)
    queryStr = queryStr.replace(/\b(gt|lt|lte|gte|in)\b/g, match => `$${match}`)
  
    // Finding resource
    query = model.find(JSON.parse(queryStr))

    // Select fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    }
    else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    // Limit
    const limit = parseInt(req.query.limit) || 25
    // skip
    const start_index = (page - 1) * limit
    const end_index = page * limit
    const total = await model.countDocuments()

    query = query.skip(start_index).limit(limit)

    if(populate) {
        query = query.populate(populate)
    }

    // Executing our query
    const result = await query   

    // Pagination result
    const pagination = {}

    if(end_index < total) {
        pagination.next = {
            page: page +1,
            limit
        }
    }

    if(start_index >0) {
        pagination.prev = {
            page: page-1,
            limit
        }
    }

    res.advancedResults = {
        success:true,
        count: result.length,
        pagination,
        data: result
    }

    next()
}

module.exports = advancedResults