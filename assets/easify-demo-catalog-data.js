(function () {
  'use strict';

  var images = window.EasifyBoxBuilderImages || {};

  function getImage(key) {
    var source = images[key];
    if (typeof source === 'string') {
      return source;
    }
    return '';
  }

  // Ported from Demo_Final/demo-catalog.js and its source image catalog.
  window.EasifyDemoCatalog = Object.freeze([
    {
      "name": "Essentials Pack",
      "type": "regular",
      "layout": "onepage",
      "season": "",
      "slug": "essentials-pack",
      "image": getImage("catalogEssentialsPack")
    },
    {
      "name": "Food Treats Hamper",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "food-treats-hamper",
      "image": getImage("catalogFoodTreatsHamper")
    },
    {
      "name": "Skincare Routine",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "skincare-routine",
      "image": getImage("catalogSkincareRoutine")
    },
    {
      "name": "Cookies For Mom",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "cookies-for-mom",
      "image": getImage("catalogCookiesForMom")
    },
    {
      "name": "Eternal Grace Curation Kit For Mom",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "eternal-grace-curation-kit-for-mom",
      "image": getImage("catalogEternalGraceCurationKitForMom")
    },
    {
      "name": "Luxury Gift Set For Dad",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "luxury-gift-set-for-dad",
      "image": getImage("catalogLuxuryGiftSetForDad")
    },
    {
      "name": "Minimal Bracelet Gift Set For Mom",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "minimal-bracelet-gift-set-for-mom",
      "image": getImage("catalogMinimalBraceletGiftSetForMom")
    },
    {
      "name": "Personalized Gift Box For Mom",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "personalized-gift-box-for-mom",
      "image": getImage("catalogPersonalizedGiftBoxForMom")
    },
    {
      "name": "Protein Snack Box For Dad",
      "type": "regular",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "protein-snack-box-for-dad-2",
      "image": getImage("catalogProteinSnackBoxForDad2")
    },
    {
      "name": "Cat Grooming",
      "type": "regular",
      "layout": "onepage",
      "season": "",
      "slug": "cat-grooming-one-page",
      "image": getImage("catalogCatGroomingOnePage")
    },
    {
      "name": "Cat Grooming",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "cat-grooming-multi-page",
      "image": getImage("catalogCatGroomingMultiPage")
    },
    {
      "name": "Cat Grooming Holiday",
      "type": "regular",
      "layout": "seasonal",
      "season": "international-cat-dog-days",
      "slug": "cat-grooming-multi-page",
      "image": getImage("catalogCatGroomingMultiPage")
    },
    {
      "name": "Mug & Coaster Set",
      "type": "regular",
      "layout": "onepage",
      "season": "",
      "slug": "mug-coaster-set-one-page",
      "image": getImage("catalogMugCoasterSetOnePage")
    },
    {
      "name": "Makeup Set",
      "type": "regular",
      "layout": "onepage",
      "season": "",
      "slug": "makeup-set-one-page",
      "image": getImage("catalogMakeupSetOnePage")
    },
    {
      "name": "Plant Combo",
      "type": "regular",
      "layout": "onepage",
      "season": "",
      "slug": "plant-combo-one-page",
      "image": getImage("catalogPlantComboOnePage")
    },
    {
      "name": "Gift Box",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "gift-box-multi-page",
      "image": getImage("catalogGiftBoxMultiPage")
    },
    {
      "name": "Makeup Set",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "makeup-set-multi-page",
      "image": getImage("catalogMakeupSetMultiPage")
    },
    {
      "name": "Plant Combo",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "plant-combo-multi-page",
      "image": getImage("catalogPlantComboMultiPage")
    },
    {
      "name": "Jewelry Box",
      "type": "regular",
      "layout": "multipage",
      "season": "",
      "slug": "jewelry-box-multi-page",
      "image": getImage("catalogJewelryBoxMultiPage")
    },
    {
      "name": "Meal Box",
      "type": "fixed",
      "layout": "onepage",
      "season": "",
      "slug": "meal-box-default-selected",
      "image": getImage("catalogMealBoxDefaultSelected")
    },
    {
      "name": "Chewer Box",
      "type": "fixed",
      "layout": "onepage",
      "season": "",
      "slug": "power-chew-box-one-page",
      "image": getImage("catalogPowerChewBoxOnePage")
    },
    {
      "name": "Chewer Box",
      "type": "fixed",
      "layout": "multipage",
      "season": "",
      "slug": "power-chew-box-multi-page",
      "image": getImage("catalogPowerChewBoxMultiPage")
    },
    {
      "name": "Chewer Box Holiday",
      "type": "fixed",
      "layout": "seasonal",
      "season": "international-cat-dog-days",
      "slug": "power-chew-box-national-dog-day",
      "image": getImage("catalogPowerChewBoxNationalDogDay")
    },
    {
      "name": "Swim Set",
      "type": "fixed",
      "layout": "onepage",
      "season": "",
      "slug": "swim-set-one-page",
      "image": getImage("catalogSwimSetOnePage")
    },
    {
      "name": "Candle Trio",
      "type": "fixed",
      "layout": "onepage",
      "season": "",
      "slug": "candle-trio-one-page",
      "image": getImage("catalogCandleTrioOnePage")
    },
    {
      "name": "Nail Polish",
      "type": "fixed",
      "layout": "onepage",
      "season": "",
      "slug": "nail-polish-set-one-page",
      "image": getImage("catalogNailPolishSetOnePage")
    },
    {
      "name": "Swim Set",
      "type": "fixed",
      "layout": "multipage",
      "season": "",
      "slug": "swim-set-multi-page",
      "image": getImage("catalogSwimSetMultiPage")
    },
    {
      "name": "Meal Box",
      "type": "fixed",
      "layout": "multipage",
      "season": "",
      "slug": "meal-box-multi-page",
      "image": getImage("catalogMealBoxMultiPage")
    },
    {
      "name": "Charm Bracelet",
      "type": "fixed",
      "layout": "multipage",
      "season": "",
      "slug": "charm-bracelet-multi-page",
      "image": getImage("catalogCharmBraceletMultiPage")
    },
    {
      "name": "Family Wellness",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "build-your-wellness-routine-1",
      "image": getImage("catalogBuildYourWellnessRoutine1")
    },
    {
      "name": "Gym Set",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "build-your-gym-set",
      "image": getImage("catalogBuildYourGymSet")
    },
    {
      "name": "Newborn Essentials",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "build-your-newborn-essentials-box",
      "image": getImage("catalogBuildYourNewbornEssentialsBox")
    },
    {
      "name": "Snack Box",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "tiered-pick-save-snack-box",
      "image": getImage("catalogTieredPickSaveSnackBox")
    },
    {
      "name": "Dog Meal Plan",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "dog-meal-subscription",
      "image": getImage("catalogDogMealSubscription")
    },
    {
      "name": "Dinnerware Set",
      "type": "tiered",
      "layout": "onepage",
      "season": "",
      "slug": "dinnerware-one-page",
      "image": getImage("catalogDinnerwareOnePage")
    },
    {
      "name": "Makeup Kit",
      "type": "tiered",
      "layout": "onepage",
      "season": "",
      "slug": "makeup-kit-one-page",
      "image": getImage("catalogMakeupKitOnePage")
    },
    {
      "name": "Bedding Set",
      "type": "tiered",
      "layout": "onepage",
      "season": "",
      "slug": "bedding-set-one-page",
      "image": getImage("catalogBeddingSetOnePage")
    },
    {
      "name": "Meal Kit",
      "type": "tiered",
      "layout": "onepage",
      "season": "",
      "slug": "meal-kit-one-page",
      "image": getImage("catalogMealKitOnePage")
    },
    {
      "name": "Dinnerware Set",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "dinnerware-multi-page",
      "image": getImage("catalogDinnerwareMultiPage")
    },
    {
      "name": "Makeup Kit",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "makeup-kit-multi-page",
      "image": getImage("catalogMakeupKitMultiPage")
    },
    {
      "name": "Bedding Set",
      "type": "tiered",
      "layout": "multipage",
      "season": "",
      "slug": "bedding-set-multi-page",
      "image": getImage("catalogBeddingSetMultiPage")
    },
    {
      "name": "Figure Bundle",
      "type": "predefined",
      "layout": "onepage",
      "season": "",
      "slug": "figure-bundle",
      "image": getImage("catalogFigureBundle")
    },
    {
      "name": "Figure Bundle",
      "type": "predefined",
      "layout": "multipage",
      "season": "",
      "slug": "figure-bundle-multi",
      "image": getImage("catalogFigureBundleMulti")
    },
    {
      "name": "Gift For Her",
      "type": "predefined",
      "layout": "multipage",
      "season": "",
      "slug": "gift-for-her",
      "image": getImage("catalogGiftForHer")
    },
    {
      "name": "Daily Wellness Pack For Mom",
      "type": "predefined",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "gift-box-for-mom",
      "image": getImage("catalogGiftBoxForMom")
    },
    {
      "name": "Grooming Essentials Kit For Dad",
      "type": "predefined",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "grooming-essentials-kit-for-dad",
      "image": getImage("catalogGroomingEssentialsKitForDad")
    },
    {
      "name": "Performance Health Pack For Dad",
      "type": "predefined",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "performance-health-pack-for-dad",
      "image": getImage("catalogPerformanceHealthPackForDad")
    },
    {
      "name": "Watch Bracelet Set For Dad",
      "type": "predefined",
      "layout": "seasonal",
      "season": "mothers-fathers-day",
      "slug": "watch-&-bracelet-set-for-dad",
      "image": getImage("catalogWatchBraceletSetForDad")
    },
    {
      "name": "Pet Treats & Toys",
      "type": "predefined",
      "layout": "multipage",
      "season": "",
      "slug": "pet-treats-toys",
      "image": getImage("catalogPetTreatsToys")
    },
    {
      "name": "Treats For Pups",
      "type": "predefined",
      "layout": "seasonal",
      "season": "international-cat-dog-days",
      "slug": "pet-treats-international-day",
      "image": getImage("catalogPetTreatsInternationalDay")
    },
    {
      "name": "Sodas Bundle",
      "type": "predefined",
      "layout": "onepage",
      "season": "",
      "slug": "sodas",
      "image": getImage("catalogSodas")
    },
    {
      "name": "Smoothies Bundle",
      "type": "predefined",
      "layout": "onepage",
      "season": "",
      "slug": "smoothies",
      "image": getImage("catalogSmoothies")
    },
    {
      "name": "Cookies Bundle",
      "type": "predefined",
      "layout": "onepage",
      "season": "",
      "slug": "cookies",
      "image": getImage("catalogCookies")
    },
    {
      "name": "Cookies & Bars",
      "type": "predefined",
      "layout": "multipage",
      "season": "",
      "slug": "cookies-bars",
      "image": getImage("catalogCookiesBars")
    },
    {
      "name": "Jewelry Bundle",
      "type": "predefined",
      "layout": "multipage",
      "season": "",
      "slug": "jewelry",
      "image": getImage("catalogJewelry")
    }
  ]);
}());
