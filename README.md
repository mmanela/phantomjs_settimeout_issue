# Patching window.setTimeout Issue in PhantomJS


This is a demonstration of a really strange issue in PhantomJs (tested in versions 1.9 and 2.0). The issue involves what happens when you monkey patch the window.setTimeout method in Javascript. The issue was discovered when debugging test failures that were using sinonJS (which monkey patches setTimeout). I worked through that issue and distilled the minimum repro out of it. 

I validated this issue does not occur in Chrome 41, Firefox 36 and IE 11. As far as I can tell it only repros in PhantomJS.


## Short Repro

1: Define a method (check) which references window.setTimeout

2: Call this method __two__ times, then patch setTimeout to be a custom method and then call check again.

CODE:
```
function check() {
    console.log("window.setTimeout = " + window.setTimeout);
}
check();
check();
window.setTimeout = function() { console.log ("Patched"); }
check();
```

OUTPUT:
```
window.setTimeout = function setTimeout() {
    [native code]
}

window.setTimeout = function setTimeout() {
    [native code]
}

window.setTimeout = function setTimeout() {
    [native code]
}
```


3: Then call to check the third time will __not__ output the contents of the monkey patched function. It will still contain the native one. THe odd thing is if you call the check() method only once (or not at all) before your patched setTimeout then it will output the expected value. For example:

CODE:
```
function check() {
    console.log("window.setTimeout = " + window.setTimeout);
}
check();
window.setTimeout = function() { console.log ("Patched"); }
check();
```

OUTPUT:
```
window.setTimeout = function setTimeout() {
    [native code]
}

window.setTimeout = function () { console.log("PATCHED"); }
```


## Runnable Repro

This repro contains a phantomJS application (phantom.js) which will demonstrate this issue. 


```
	phantomjs.exe phantom.js
```

This repro defines 3 method (check1, check2, check3) all which just output the contents of window.setTimeout. 

__check1__: Called 3 times. Two times before patching setTimeout and once after.
__check2__: Called 2 times. Once before patching setTimeout and once after.
__check3__: Called 1 time.  Only called after patching setTimeout

When run you will see the following output (I formatted it below so it reads better):

1. Call method check1 which outputs contents of window.setTimeout
	check1: window.setTimeout = function setTimeout() {
	    [native code]
	}

2. Call methods check1 and check2 which both output contents of window.setTimeout
	check1: window.setTimeout = function setTimeout() {
	    [native code]
	}

	check2: window.setTimeout = function setTimeout() {
	    [native code]
	}

3. Moneky-patch the contents of window.setTimeout with a dummy method which just outputs the words PATCHED

4. Call methods check1, check2 and check3 which outputs contents of window.setTimeout.

	check1: window.setTimeout = function setTimeout() {
	    [native code]
	}

	check2: window.setTimeout = function () { console.log("PATCHED"); }

	check3: window.setTimeout = function () { console.log("PATCHED"); }


5. Note that check3 (which is called once in this file) and check2 (which is called twice) both print out the expected patched setTimeout method.
 However, check1 (which is called three times) does not.
