require("dotenv").config();
var express = require("express");
var bodyParser = require("body-parser");
// const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
var corse = require("cors");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var transport = require("./models/transport");
var miscellenious = require("./models/miscellenious");
var food = require("./models/foodschema");
var shopping = require("./models/shopping");
var household = require("./models/household");
var entertainment = require("./models/entertainment");
var User = require("./models/user");
const path = require("path");
var Useras = require("./models/user");
const jwt = require("jsonwebtoken");
const sign = require("jsonwebtoken/sign");
const user = require("./models/user");
const { ObjectId } = require("mongoose");
const port = process.env.PORT || 3000;
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(corse());
app.use(express.static(path.join(__dirname, "public")));
mongoose.Promise = global.Promise;

mongoose
  .connect(
    "mongodb+srv://suchandra:Suchandra123@expenses-8ltf8.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log("successful db connection");
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(
  require("express-session")({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//checking if the server started
const listen = app.listen(port, function (req, res) {
  console.log("server started" + listen.address().port);
});

//get to the start page
app.get("/", isloggedinfor, function (req, res, next) {
  req.user
    .populate("foodexpense")
    .populate("entertainmentexpense")
    .populate("householdexpense")
    .populate("miscelleniousexpense")
    .populate("shoppingexpense")
    .populate("transportexpense");

  res.render("home", { user1: req.user });
}),
  //going to register page
  app.get("/signup?", function (req, res, next) {
    res.render("register", { x: false, z: false, y: false, p: false });
  });

//going to login page
app.get("/login?", function (req, res, next) {
  res.render("login", { data: { view: false } });
});

//register route
app.post("/signup", function (req, res) {
  if (req.body.username.length <= 2 || req.body.username.length > 20) {
    res.render("register", { x: false, z: true, y: false, p: false });
  } else if (req.body.phoneno.length < 10 || req.body.phoneno.length > 13) {
    res.render("register", { x: false, z: false, y: true, p: false });
  } else if (req.body.password.length <= 7 || req.body.password.length > 20) {
    res.render("register", { x: false, z: false, y: false, p: true });
  } else {
    var nameofuser = (Users = new User({
      email: req.body.email,
      username: req.body.username,
      name: req.body.name,
      phoneno: req.body.phoneno,
    }));

    User.register(Users, req.body.password, function (err, user) {
      if (err) {
        console.log(err);
        res.render("register", { x: true, z: false, y: false, p: false });
      } else {
        res.render("login", { data: { view: false } });
      }
    });
  }
});
//logging in function
app.post("/signin", function (req, res) {
  if (!req.body.username) {
    console.log("username nottaken");
    res.render("login", {
      data: { view: true, msg1: "Username was not given" },
    });
  } else {
    if (!req.body.password) {
      console.log("password not taken");
      res.render("login", {
        data: { view: true, msg: "Password was not given" },
      });
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          console.log(err);

          res.render("login", { data: { view: true, msg: err } });
        } else {
          if (!user) {
            console.log("usernotfound");
            res.render("login", {
              data: { view: true, msg: "Username or password incorrect " },
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                console.log(err);
                res.render("login", { data: { view: true, msg: err } });
              } else {
                User.findById(user._id)
                  .populate("foodexpense")
                  .populate("entertainmentexpense")
                  .populate("householdexpense")
                  .populate("miscelleniousexpense")
                  .populate("shoppingexpense")
                  .populate("transportexpense")
                  .exec((err, user) => {
                    if (err) console.log(err);
                    else {
                      // console.log(user);
                      res.render("home", { user1: user });
                    }
                  });
              }
            });
          }
        }
      })(req, res);
    }
  }
});
app.get("/signin", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("foodexpense")
    .populate("entertainmentexpense")
    .populate("householdexpense")
    .populate("miscelleniousexpense")
    .populate("shoppingexpense")
    .populate("transportexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        // console.log(user);
        res.render("home", { user1: user });
      }
    });
}),
  //profile page
  app.get("/profile", function (req, res, next) {
    res.render("profile", { user: req.user, avai: false });
  });
//profile page
app.post("/profile", isloggedin, function (req, res, next) {
  if (req.body.username) {
    User.count({ username: req.body.username }).then((count) => {
      if (count > 0) {
        console.log("entered");
        res.render("profile", { user: req.user, avai: true });
      } else {
        req.user.username = req.body.username;
      }
    });
  }
  if (req.body.name) {
    req.user.name = req.body.name;
  }
  if (req.body.phoneno) {
    req.user.phoneno = req.body.phoneno;
  }
  req.user.save();
  res.render("profile", { user: req.user, avai: false });
});

function isloggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/logout");
  }
}
function isloggedinfor(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.render("start");
  }
}
//logout route
app.get("/logout", function (req, res, next) {
  req.logout();
  res.render("login", { data: { view: false } });
}),
  app.get("/changepassword", isloggedin, function (req, res, next) {
    res.render("changepass");
  }),
  app.post("/changepassword", isloggedin, function (req, res, next) {
    console.log(req.body.password);
    if (req.body.password == req.body.confirmpassword) {
      req.user.setPassword(req.body.password, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          user.save();
        }
      });
      res.render("profile", { user: req.user });
    }
  }),
  //is autorized in authentication
  (isauthorized = function (req, rs, next) {
    try {
      const t = req.headers.Authorization.split(" ")[1];
      jwt.verify(t, process.env.secret, function (err, singedinalready) {
        if (singedinalready && singedinalready.id == req.params.id) {
          return next();
        } else {
          console.log("not authorized");
          console.log("not authorized");
        }
      });
    } catch (err) {
      console.log(err);
    }
  });
app.get("/food/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("foodexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("add", { user1: user });
      }
    });
});
//adding into food
app.post("/food/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    console.log("new date is" + newdateis);
    console.log(req.body.cost);
    console.log(req.body.description);
    //       console.log(result);
    let newitem = await food.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.foodexpense.push(newitem.id);
    var test_1 = await req.user.save();

    User.findById(req.user._id)
      .populate("foodexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("add", { user1: user });
        }
      });

    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});
//entertainment
app.get("/entertainment/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("entertainmentexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("addent", { user1: user });
      }
    });
});
//adding into food
app.post("/entertainment/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    console.log(req.body.cost);
    console.log(req.body.description);
    //       console.log(result);
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    let newitem = await entertainment.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.entertainmentexpense.push(newitem.id);
    for (var i = 0; i != req.user.entertainmentexpense.length; i++) {
      console.log("hi");
    }
    var test_1 = await req.user.save();
    User.findById(req.user._id)
      .populate("entertainmentexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("addent", { user1: user });
        }
      });
    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});

//travel
app.get("/transport/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("transportexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("addtra", { user1: user });
      }
    });
});
//adding into transport
app.post("/transport/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    console.log(req.body.cost);
    console.log(req.body.description);
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    //       console.log(result);
    let newitem = await transport.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.transportexpense.push(newitem.id);
    for (var i = 0; i != req.user.transportexpense.length; i++) {
      console.log("hi");
    }
    var test = await req.user.save();
    User.findById(req.user._id)
      .populate("transportexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("addtra", { user1: user });
        }
      });
    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});

//household
app.get("/household/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("householdexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("addhou", { user1: user });
      }
    });
});
//adding into food
app.post("/household/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    console.log(req.body.cost);
    console.log(req.body.description);
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    //       console.log(result);
    let newitem = await household.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.householdexpense.push(newitem.id);
    for (var i = 0; i != req.user.householdexpense.length; i++) {
      console.log("hi");
    }
    var test_1 = await req.user.save();
    User.findById(req.user._id)
      .populate("householdexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("addhou", { user1: user });
        }
      });
    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});

//shopping
app.get("/shopping/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("shoppingexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("addexp", { user1: user });
      }
    });
});
//adding into shopping
app.post("/shopping/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    console.log(req.body.cost);
    console.log(req.body.description);
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    //       console.log(result);
    let newitem = await shopping.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.shoppingexpense.push(newitem.id);
    // for(var i=0;i!=req.user.shoppingexpense.length;i++){
    //   console.log("hi");
    // }
    var test_1 = await req.user.save();

    User.findById(req.user._id)
      .populate("shoppingexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("addexp", { user1: user });
        }
      });
    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});

//other
app.get("/miscellenious/add", isloggedin, function (req, res, next) {
  User.findById(req.user._id)
    .populate("miscelleniousexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(user);
        res.render("addmis", { user1: user });
      }
    });
});
//adding into other
app.post("/miscellenious/add", isloggedin, async function (req, res, next) {
  try {
    // User.findOne({ _id: req.params.id })
    //   .then(async function (result) {
    //     if (result) {
    console.log(req.body.cost);
    console.log(req.body.description);
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let dat1 = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();
    let newdateis = year + "-" + month + "-" + dat1;
    //       console.log(result);
    let newitem = await miscellenious.create({
      cost: req.body.cost,
      date: newdateis,
      description: req.body.description,
      user: req.user.id,
    });
    //       // newitem.save();
    //       console.log("found the user");
    //       console.log(newitem);
    var test = await req.user.miscelleniousexpense.push(newitem.id);

    console.log(test);

    var test_1 = await req.user.save();

    User.findById(req.user._id)
      .populate("miscelleniousexpense")
      .exec((err, user) => {
        if (err) console.log(err);
        else {
          console.log(user);
          res.render("addmis", { user1: user });
        }
      });
    // let mamaa = User.foodexpense.findById(newitem._id).populate("", {
    //   username: true,
    // });
    // return res.json(mamaa);
  } catch (err) {
    console.log(err);
  }
});

app.get("/delfood/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("foodexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.foodexpense) {
          console.log(req.user.foodexpense[i]._id);
          if (req.params["id"] == req.user.foodexpense[i]._id) {
            console.log("hai");
            req.user.foodexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        food.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("foodexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("add", { user1: user });
              }
            });
        });
      }
    });
});

app.get("/delent/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("entertainmentexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.entertainmentexpense) {
          console.log(req.user.entertainmentexpense[i]._id);
          if (req.params["id"] == req.user.entertainmentexpense[i]._id) {
            console.log("hai");
            req.user.entertainmentexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        entertainment.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("entertainmentexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("addent", { user1: user });
              }
            });
        });
      }
    });
});

app.get("/delhouse/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("householdexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.householdexpense) {
          console.log(req.user.householdexpense[i]._id);
          if (req.params["id"] == req.user.householdexpense[i]._id) {
            console.log("hai");
            req.user.householdexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        household.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("householdexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("addhou", { user1: user });
              }
            });
        });
      }
    });
});

app.get("/deltrans/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("transportexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.transportexpense) {
          console.log(req.user.transportexpense[i]._id);
          if (req.params["id"] == req.user.transportexpense[i]._id) {
            console.log("hai");
            req.user.transportexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        transport.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("transportexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("addtra", { user1: user });
              }
            });
        });
      }
    });
});

app.get("/delshop/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("shoppingexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.shoppingexpense) {
          console.log(req.user.shoppingexpense[i]._id);
          if (req.params["id"] == req.user.shoppingexpense[i]._id) {
            console.log("hai");
            req.user.shoppingexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        shopping.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("shoppingexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("addexp", { user1: user });
              }
            });
        });
      }
    });
});

app.get("/delmisc/:id", isloggedin, async function (req, res, next) {
  User.findById(req.user._id)
    .populate("miscelleniousexpense")
    .exec((err, user) => {
      if (err) console.log(err);
      else {
        console.log(req.params["id"], "hiiiiiiiii");
        for (var i in req.user.miscelleniousexpense) {
          console.log(req.user.miscelleniousexpense[i]._id);
          if (req.params["id"] == req.user.miscelleniousexpense[i]._id) {
            console.log("hai");
            req.user.miscelleniousexpense.splice(i, 1);
            req.user.save();
            break;
          }
        }
        miscellenious.findByIdAndRemove(req.params["id"], function (err, doc) {
          User.findById(req.user._id)
            .populate("miscelleniousexpense")
            .exec((err, user) => {
              if (err) console.log(err);
              else {
                console.log(user);
                res.render("addmis", { user1: user });
              }
            });
        });
      }
    });
});
