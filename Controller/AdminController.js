const Enquiry = require('../Models/Enquiry');
const Property = require('../Models/Property');
const Saved = require('../Models/Saved');
const User = require('./../Models/User');
const firebase = require("./../Utils/firebaseAdminInit");

const converttocardData = (Data) =>{
    Data.forEach((element) => {
        property = {};
        element.Images.images.forEach(img=>{
          if(img.includes("CoverImages")){
            property.image = img;
          }
        })
        property.title =
          element.propertyType +
          " For " +
          element.propertyFor +
          " at " +
          element.name+
          ", "+
          element.locality
          ;
        property.area = element.propertyFeatures.carpetArea;
        property.furnishing = element.propertyFeatures.furnishingStatus;
        property.status =
          element.priceDetails.possessionStatus ||
          "Possession by " +
            element.priceDetails.avaliableFrom.month +
            " " +
            element.priceDetails.avaliableFrom.year;
        property.price =
          element.priceDetails.expectedPrice || element.priceDetails.expectedRent;
        property.bedroom = element.propertyFeatures.bedrooms + " Bed";
        property.bathroom = element.propertyFeatures.bathroom + " Bath";
        properties.push(property);
      });
      return Data;
}
module.exports.isAdmin = (req,res,next) =>{
    if(req.isAuthenticated() && req.user.isAdmin){
        next();
    }
    else{
        res.redirect("/");
    }
}

module.exports.AdminDashboard = async (req,res) =>{
    const Page = req.query.page||1;
    const limit = req.query.limit * 1||14;
    const skip = (Page - 1) * limit;
    Property.aggregate([{
      $facet : {
        "ActivatedProperty" : [
          {
            $match : {
              isAvaliable : true
            },
          },
            {
              $project:{
                title:{
                  $concat : ["$propertyType"," For ","$propertyFor"," at ","$name",",",'$locality']
                },
                isAvaliable : 1,
                address : 1,
                createdAt : 1,
                "priceDetails.expectedPrice" : 1,
                "propertyFeatures.carpetArea" : 1
              }
            }
        ],
        "DisabledProperty" : [
          {
            $match : {
              isAvaliable : false
            }
          },
          {
            $project:{
              title:{
                $concat : ["$propertyType"," For ","$propertyFor"," at ","$name",",",'$locality']
              },
              isAvaliable : 1,
              address : 1,
              createdAt : 1,
              "priceDetails.expectedPrice" : 1,
              "propertyFeatures.carpetArea" : 1
            }
          }
        ],
        "AllProperty" : [
          {
            $match : {$or : [
              {isAvaliable : true},
              {isAvaliable : false}
            ]}
          },
            {
              $project:{
                title:{
                  $concat : ["$propertyType"," For ","$propertyFor"," at ","$name",",",'$locality']
                },
                isAvaliable : 1,
                address : 1,
                createdAt : 1,
                "priceDetails.expectedPrice" : 1,
                "propertyFeatures.carpetArea" : 1
              }
            }
        ]
      }
    }]).catch(err=>{
      console.log(err)
    }).then(async result=>{
      let enquiries = await Enquiry.find({contacted : false});
      console.log(enquiries);
      res.render("adminDashboard",{
        properties : result,
        enquiries : enquiries
      })
    })
}

module.exports.TogglePropertyAvaliablity = (req,res,next) =>{
  Property.findByIdAndUpdate(req.body.id,{isAvaliable : req.body.status}).then(property=>{
    if(req.body.status==true){
      req.flash("success","Property has ben Activated");
    }
    else{
      req.flash("success","Property has been deactived");
    }
    res.redirect('/admin/admindashboard')
  }).catch(err=>{next(err)});
}

module.exports.DeletePropertyAvaliablity = (req,res,next) =>{
  Property.findById(req.body.id).then(result=>{
    firebase.deleteFile(result.Images.imageid);
    Property.findByIdAndDelete(req.body.id).then(deleted=>{
      req.flash("success","Property Has Been Removed");
      res.redirect('/admin/admindashboard')
    });
  }).catch(err=>{next(err)})
  
  res.redirect('/admin/admindashboard')
}

module.exports.GetCustomerSaved = (req,res,next) =>{
  let phonenumber = req.query.number;
  User.find({phone : phonenumber}).then(user=>{
    Saved.find({customerID : user._id}).then(saved=>{
      res.render("/admin/admindashboard",saved);
    })
  }).catch(err=>next(err));
}

module.exports.MarkQuerySolved = (res,req) =>{
  Enquiry.findByIdAndUpdate(req.body.id,{contacted : true}).then(saved=>{
    req.flash("success","Enquiry Has Been Solved");
    res.render("/admin/admindashboard");
  });
}