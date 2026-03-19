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
  document.querySelector(selector).innerHTML = html;
};

var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  return string.replace(new RegExp(propToReplace, "g"), propValue);
};

var switchMenuToActive = function () {
  var home = document.querySelector("#navHomeButton");
  home.className = home.className.replace(/active/g, "");

  var menu = document.querySelector("#navMenuButton");
  if (menu.className.indexOf("active") === -1) {
    menu.className += " active";
  }
};

function chooseRandomCategory(categories) {
  var index = Math.floor(Math.random() * categories.length);
  return categories[index];
}

// ON LOAD
document.addEventListener("DOMContentLoaded", function () {

  showLoading("#main-content");

  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowHomeHTML,
    true
  );

});

// HOME PAGE
function buildAndShowHomeHTML(categories) {

  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {

      var randomCategory = chooseRandomCategory(categories);

      // ВАЖНО: с кавычками, как требует onclick
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

// CATEGORIES
dc.loadMenuCategories = function () {
  showLoading("#main-content");

  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML
  );
};

function buildAndShowCategoriesHTML(categories) {

  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (titleHtml) {

      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {

          switchMenuToActive();

          var html = buildCategoriesViewHtml(
            categories,
            titleHtml,
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

// MENU ITEMS
dc.loadMenuItems = function (categoryShort) {

  showLoading("#main-content");

  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort,
    buildAndShowMenuItemsHTML
  );
};

function buildAndShowMenuItemsHTML(categoryMenuItems) {

  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (titleHtml) {

      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (itemHtml) {

          switchMenuToActive();

          var html = buildMenuItemsViewHtml(
            categoryMenuItems,
            titleHtml,
            itemHtml
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

  var items = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;

  for (var i = 0; i < items.length; i++) {

    var html = itemHtml;

    html = insertProperty(html, "short_name", items[i].short_name);
    html = insertProperty(html, "catShortName", catShortName);

    html = insertItemPrice(html, "price_small", items[i].price_small);
    html = insertItemPortionName(html, "small_portion_name", items[i].small_portion_name);

    html = insertItemPrice(html, "price_large", items[i].price_large);
    html = insertItemPortionName(html, "large_portion_name", items[i].large_portion_name);

    html = insertProperty(html, "name", items[i].name);
    html = insertProperty(html, "description", items[i].description);

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function insertItemPrice(html, propName, value) {
  if (!value) return insertProperty(html, propName, "");
  return insertProperty(html, propName, "$" + value.toFixed(2));
}

function insertItemPortionName(html, propName, value) {
  if (!value) return insertProperty(html, propName, "");
  return insertProperty(html, propName, "(" + value + ")");
}

global.$dc = dc;

})(window);
