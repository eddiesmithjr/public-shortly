var mongoose = require('mongoose');
var Promise = require('bluebird');
var crypto = require('crypto');

var Schema = mongoose.Schema;

// const update = (url) => {
//   var shasum = crypto.createHash('sha1');
//   return shasum.update(url);
// };

var LinkSchema = new Schema(
  {
    url: { type: String, max: 255 },
    baseUrl: { type: String, max: 255 },
    code: { type: String, max: 100 },
    title: { type: String, max: 255 },
    visits: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  }
);
LinkSchema.pre('save', function (next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  //this.code = shasum.digest('hex').slice(0, 5);
  this.set('code', shasum.digest('hex').slice(0, 5));

  next();
});
//Export model
module.exports = mongoose.model('Link', LinkSchema);
