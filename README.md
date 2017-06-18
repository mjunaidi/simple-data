## Running it locally
In windows, in command prompt, execute ```serve```. Then, access it on ```http://localhost:8888/index.html```.

## What to do on starting a new project based on this repo
1. In ```index.html```, renamed the title tag  ```<title>TrendUI</title>``` to the new name.
2. The angularjs main app module and other modules are reffered from the index at bottom of the html file:
```html
<script src="app/ui/main.controller.js"></script>
<script src="app/ui/modal.controller.js"></script>
<script src="app/ui/app.js"></script>
<script src="app/ui/app.routes.js"></script>
```
3. Go to ```app/ui/``` directory.
4. Related to that, maybe changed the brand name in the ```app/ui/html/navbar.html```. Find this tag ```<span><a class="navbar-brand" href="">TrendUI</a></span>``` and replaced ```TrendUI``` to the new name.
5. And also in ```app/ui/json/about.json```. This is when user click on the about button on the right side of the navbar. **Note:** Currently there is a bug when serving this app in github pages without custom name, the ```about.json``` file will always be referred to the main default github pages ```username.github.io```. So right now, we have to manually specify the relative path name to the ```about.json``` file in ```main.controller.js```, simply change ```trendui``` after ```'paths' : [ ``` to the proper relative paths:
```javascript
this.aboutOpts = {
  templateUrl : 'app/ui/html/about.html',
  config : function() {
    return {
      'get' : {
        'paths' : [ 'trendui/app/ui/json/about.json' ],
        'key' : 'init'
      }
    };
  }
};
```
**Note:** This issue is not appear to be an issue for github pages with custom domain name.

## Adding a new page
1. Create a new html file in the ```app/ui/html/```.
2. Register the route to the page in ```app/ui/app.routes.js```. Add another to ```$routeProvider```, for example:
```javascript
.when("/newpage", {
  templateUrl : 'app/ui/html/newpage.html'
})
```
3. To make the link appear in the navbar, simply register it in the ```app/ui/main.controller.js``` in function ```MainController.prototype._initHeader``` for example adding a new page is:
```javascript
this.navbar = {
  templateUrl : 'app/ui/html/navbar.html',
  pages: [
    {
      "name" : "Home", "path" : "/", "ra" : false
    }, {
      "name" : "Blog", "path" : "/blog", "ra" : false
    }, {
      "name" : "New Page", "path" : "/newpage", "ra" : false
    }
  ]
};
```
**Note:** ```ra``` var in the entry of pages is a work in progress for feature **required authentication/authorisation**.
4. If the page required any controller process, add ```ng-init="ctrl._initBody()"``` in any early tag in the html file.
5. Then, in the ```app/ui/main.controller.js```, define what needs to be done based on the url path:
```javascript
MainController.prototype._initBody = function() {
  if (this._location.path() === '/') {
    /* Anything that needs to be executed in home page goes here... */
  }

  if (this._location.path() === '/blog') {
    /* Anything that needs to be executed in path /blog goes here... */
  }

  if (this._location.path() === '/newpage') {
    /* Anything that needs to be executed in path /newpage goes here... */
  }
};
```
