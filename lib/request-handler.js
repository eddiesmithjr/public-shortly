var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find().then(function (links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function (req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findOne({ url: uri }).then(function (found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function (err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save().then(function (newLink) {
          res.status(200).send(newLink);
        })
        .catch(err=>console.log(err))  ;
      });
    }
    
  })
};

exports.loginUser = function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      res.redirect('/login');
    } else {
      user.comparePassword(password, function (match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/login');
        }
      });
    }
  })
};


exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username }, (err, user) => {
    if (err) {
      console.log(err);
    }
    if (!user) {
      var newUser = new User();
      newUser.username = username;
      newUser.password = newUser.generateHash(password);
      newUser.save(function (err, newuser) {
        if (err) {
          console.log(err);
        }
          util.createSession(req, res, newuser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

exports.navToLink = function (req, res) {
  Link.findOne({ code: req.params[0] }).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function () {
          return res.redirect(link.get('url'));
        });
      // Link.update({ visits }, { visits: visits + 1 })
      //   .then(function () {
      //     return res.redirect(link.get('url'));
      //   })
      //   .catch(err => console.log(err));
    }
  });
}

// var request = require('request');
// var crypto = require('crypto');
// var bcrypt = require('bcrypt-nodejs');
// var util = require('../lib/utility');

// var db = require('../app/config');
// var User = require('../app/models/user');
// var Link = require('../app/models/link');



// exports.renderIndex = function (req, res) {
//   res.render('index');
// };

// exports.signupUserForm = function (req, res) {
//   res.render('signup');
// };

// exports.loginUserForm = function (req, res) {
//   res.render('login');
// };

// exports.logoutUser = function (req, res) {
//   req.session.destroy(function () {
//     res.redirect('/login');
//   });
// };

// exports.fetchLinks = function (req, res) {
//   Link.find({}).exec(function (err, links) {
//     res.status(200).send(links);
//   });
// };

// exports.saveLink = function (req, res) {
//   var uri = req.body.url;

//   if (!util.isValidUrl(uri)) {
//     console.log('Not a valid url: ', uri);
//     return res.sendStatus(404);
//   }

//   Link.findOne({ url: uri }).exec(function (err, found) {
//     if (found) {
//       res.status(200).send(found);
//     } else {
//       util.getUrlTitle(uri, function (err, title) {
//         if (err) {
//           console.log('Error reading URL heading: ', err);
//           return res.sendStatus(404);
//         }
//         var newLink = new Link({
//           url: uri,
//           title: title,
//           baseUrl: req.headers.origin,
//           visits: 0
//         });
//         newLink.save(function (err, newLink) {
//           if (err) {
//             res.status(500).send(err);
//           } else {
//             res.status(200).send(newLink);
//           }
//         });
//       });
//     }
//   });
// };

// exports.loginUser = function (req, res) {
//   var username = req.body.username;
//   var password = req.body.password;

//   User.findOne({ username: username })
//     .exec(function (err, user) {
//       if (!user) {
//         res.redirect('/login');
//       } else {
//         User.comparePassword(password, user.password, function (err, match) {
//           if (match) {
//             util.createSession(req, res, user);
//           } else {
//             res.redirect('/login');
//           }
//         });
//       }
//     });
// };

// exports.signupUser = function (req, res) {
//   var username = req.body.username;
//   var password = req.body.password;

//   User.findOne({ username: username })
//     .exec(function (err, user) {
//       if (!user) {
//         var newUser = new User({
//           username: username,
//           password: password
//         });
//         newUser.save(function (err, newUser) {
//           if (err) {
//             res.status(500).send(err);
//           }
//           util.createSession(req, res, newUser);
//         });
//       } else {
//         console.log('Account already exists');
//         res.redirect('/signup');
//       }
//     });
// };

// exports.navToLink = function (req, res) {
//   Link.findOne({ code: req.params[0] }).exec(function (err, link) {
//     if (!link) {
//       res.redirect('/');
//     } else {
//       link.visits++;
//       link.save(function (err, link) {
//         res.redirect(link.url);
//         return;
//       });
//     }
//   });
// };