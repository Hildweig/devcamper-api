const mongoose = require('mongoose');
const Bootcamp = require('./Bootcamp');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bootcamp',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Please add a user'],
    ref: 'User'
  }
});

// Static method to get average course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    
  console.log('Calculating average cost...'.blue)
  // Get the average cost of a bootcamp
  const avg_cost_query = [
      {
        '$match': {
          'bootcamp': bootcampId
        }
      }, {
        '$group': {
          '_id': '$bootcamp', 
          'averageCost': {
            '$avg': '$tuition'
          }
        }
      }
    ]

    try {
      const averageCost = await this.aggregate(avg_cost_query)
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {averageCost: Math.ceil(averageCost[0].averageCost/10)*10}, {
        runValidators: true
    })
    }
    catch(err) {
      console.log(err)
    }
   
}

// Call getAverageCost after save
CourseSchema.post('save', function() {
  this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before relove
CourseSchema.pre('remove', function() {
  this.constructor.getAverageCost(this.bootcamp)
})
module.exports = mongoose.model('Course', CourseSchema)