const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
      type: String,
      required: true
  },
  branch: {
      type: String,
      required: true
  },
  courses: {
      teaching: [{
                  courseId:
                    { 
                      type: Schema.Types.ObjectId, 
                      ref:'Course'
                    },
                  code:
                    { 
                      type: String
                    },
                  title:
                  { 
                    type: String
                  }
                }],
      teachingAssistant: [{
                            courseId:
                              { 
                                type: Schema.Types.ObjectId, 
                                ref:'Course'
                              },
                            code:
                              { 
                                type: String
                              },
                            title:
                            { 
                              type: String
                            }
                          }],
      studying: [{
                  courseId:
                    { 
                      type: Schema.Types.ObjectId, 
                      ref:'Course'
                    },
                  code:
                    { 
                      type: String
                    },
                  title:
                  { 
                    type: String
                  }
                }]
  }
});

userSchema.methods.addTeachingCourse = function(courseId,code,title){
  this.courses.teaching.push({
    courseId : courseId,
    code: code,
    title:title
  });
  return this.save();
}

userSchema.methods.addTACourse = function(courseId,code,title){
  this.courses.teachingAssistant.push({
    courseId : courseId,
    code: code,
    title:title
  });
  return this.save();
}

userSchema.methods.addStudyingCourse = function(courseId,code,title){
  this.courses.studying.push({
    courseId : courseId,
    code: code,
    title:title
  });
  return this.save();
}

const User = mongoose.model('User', userSchema);

module.exports = User;