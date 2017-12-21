// var mongoose = require('mongoose');
// var Promise = require('bluebird');
// var crypto = require('crypto');

// var Schema = mongoose.Schema;

// // const update = (url) => {
// //   var shasum = crypto.createHash('sha1');
// //   return shasum.update(url);
// // };

// var LinkSchema = new Schema(
//   {
//     url: { type: String, required: true, max: 255 },
//     baseUrl: { type: String, required: true, max: 255 },
//     code: { type: String, max: 100 },
//     title: { type: String, required: true, max: 255 },
//     visits: { type: Number, default: 0},
//     timestamp: { type: Date, default: Date.now },
//   }
// );
// LinkSchema.pre('save', function (next) {
//   console.log('this', this);
//   var shasum = crypto.createHash('sha1');
//   shasum.update(this.url);
//   //this.code = shasum.digest('hex').slice(0, 5);
//   this.set('code', shasum.digest('hex').slice(0, 5));

//   next();
// });
//   //Export model
// module.exports = mongoose.model('Link', LinkSchema);

var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

var linkSchema = mongoose.Schema({
  visits: Number,
  link: String,
  title: String,
  code: String,
  baseUrl: String,
  url: String
});

var Link = mongoose.model('Link', linkSchema);

var createSha = function (url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
};

linkSchema.pre('save', function (next) {
  var code = createSha(this.url);
  this.code = code;
  next();
});

module.exports = Link;