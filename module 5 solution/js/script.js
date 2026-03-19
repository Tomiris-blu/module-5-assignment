(function (global) {

var dc = {};

var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl =
  "https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl =
  "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string.replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};

var switchMenuToActive = function () {
  var classes = document.querySelector("#navHomeButton").className;
  classes = classes.replace(new RegExp("active", "g"), "");
  document.querySelector("#navHomeButton").className = classes;

  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") === -1) {
    classes += " active";
    document.querySelector("#navMenuButton").className = classes;
  }
};

function chooseRandomCategory(categories) {
  var randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

document.addEventListener("DOMContentLoaded", function () {

  showLoading("#main-content");

  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowHomeHTML,
    true
  );

});

function buildAndShowHomeHTML(categories) {

  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {

      var randomCategory = chooseRandomCategory(categories);

      homeHtml = insertProperty(
        homeHtml,
        "randomCategoryShortName",
        "'" + randomCategory.short_name + "'"
      );

      insertHtml("#main-content", homeHtml);

    },
    false
  );
}

dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML
  );
};

dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort,
    buildAndShowMenuItemsHTML
  );
};

function buildAndShowCategoriesHTML(categories) {

  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {

      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {

          switchMenuToActive();

          var html = buildCategoriesViewHtml(
            categories,
            categoriesTitleHtml,
            categoryHtml
          );

          insertHtml("#main-content", html);
        },
        false
      );
    },
    false
  );
}

function buildCategoriesViewHtml(categories, titleHtml, categoryHtml) {

  var finalHtml = titleHtml;
  finalHtml += "<section class='row'>";

  for (var i = 0; i < categories.length; i++) {
    var html = categoryHtml;

    html = insertProperty(html, "name", categories[i].name);
    html = insertProperty(html, "short_name", categories[i].short_name);

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function buildAndShowMenuItemsHTML(categoryMenuItems) {

  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {

      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {

          switchMenuToActive();

          var html = buildMenuItemsViewHtml(
            categoryMenuItems,
            menuItemsTitleHtml,
            menuItemHtml
          );

          insertHtml("#main-content", html);
        },
        false
      );
    },
    false
  );
}

function buildMenuItemsViewHtml(categoryMenuItems, titleHtml, itemHtml) {

  titleHtml = insertProperty(
    titleHtml,
    "name",
    categoryMenuItems.category.name
  );

  titleHtml = insertProperty(
    titleHtml,
    "special_instructions",
    categoryMenuItems.category.special_instructions
  );

  var finalHtml = titleHtml;
  finalHtml += "<section class='row'>";

  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;

  for (var i = 0; i < menuItems.length; i++) {

    var html = itemHtml;

    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "catShortName", catShortName);

    html = insertItemPrice(html, "price_small", menuItems[i].price_small);
    html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);

    html = insertItemPrice(html, "price_large", menuItems[i].price_large);
    html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);

    html = insertProperty(html, "name", menuItems[i].name);
    html = insertProperty(html, "description", menuItems[i].description);

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function insertItemPrice(html, propName, value) {
  if (!value) {
    return insertProperty(html, propName, "");
  }
  value = "$" + value.toFixed(2);
  return insertProperty(html, propName, value);
}

function insertItemPortionName(html, propName, value) {
  if (!value) {
    return insertProperty(html, propName, "");
  }
  value = "(" + value + ")";
  return insertProperty(html, propName, value);
}

global.$dc = dc;

})(window);
