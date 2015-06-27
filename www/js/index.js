/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
// shim layer with setTimeout fallback


window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var app = {
        paused: false
    },
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    startingScore = 0,
    startingEnemyScore = 0,
    continueAnimating = false,
    score, 
    enemyscore;

var myWatch = new Stopwatch(); 


// koala variables
var koalaWidth = 40;
var koalaHeight = 54;
var koalaSpeed = 5;
var koala = {
    x: 0,
    y: 80,
    width: koalaWidth,
    height: koalaHeight,
    koalaSpeed: koalaSpeed
}

// coin variables
var coinWidth = 30;
var coinHeight = 30;
var totalcoins = 2;
var coins = [];
for (var i = 0; i < totalcoins; i++) {
    addcoin();
}

function addcoin() {
    var coin = {
        width: coinWidth,
        height: coinHeight
    }
    resetcoin(coin);
    coins.push(coin);
}

// move the coin to a random position near the top-of-canvas
// assign the coin a random speed
function resetcoin(coin) {
    coin.x = Math.random() * (canvas.width - coinWidth);
    coin.y = 300 + Math.random() * 30;
    coin.speed = 1 + Math.random() * 3;
}

// enemy variables
var enemyWidth = 64;
var enemyHeight = 32;
var totalenemys = 1;
var enemys = [];
for (var i = 0; i < totalenemys; i++) {
    addenemy();
}

function addenemy() {
    var enemy = {
        width: enemyWidth,
        height: enemyHeight
    }
    resetenemy(enemy);
    enemys.push(enemy);
}

// move the enemy to a random position near the top-of-canvas
// assign the enemy a random speed
function resetenemy(enemy) {
    enemy.x = Math.random() * (canvas.width - enemyWidth);
    enemy.y = 300 + Math.random() * 30;
    enemy.speed = 1 + Math.random() * 3;
}

function fetchScore() {

    var documentHeight = $(window).height();

    if (score >= 0 && score <= 9) {
        $("li strong").html("0" + score);
    } else if (score >= 10 || score <= -1) {
        $("li strong").html(score);
    }

    //hide game and show initial screen 
    $("#stage, footer").css('display', 'none');
    $("#enter-initials").css('display', 'block');

    //get value from get score button 
    $("#save-initials").click(function() {

        var name = $("#txt-name").val();
        var nameLength = name.length;

        if (nameLength >= 3 && nameLength <= 10) {
            saveInitials();
        }
        else {
            alert("Please enter a name between 3 - 10 characters");
;        }
    });
}


function saveInitials(){
    var name = $("#txt-name").val();

    $("#enter-initials").css('display', 'none');

    setTimeout(function(){
        $("#highscore-table").css('display', 'block');
        setTimeout(function(){
            $("#highscore-table").animate({ opacity: 1}, 500);
        }, 500);
    }, 500); 

    //post the score to the highscore database 
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://koaladash.com/app/savescores.php", 
        data: {name: name, score: score}
    });

    //get data back from the highscore database and post that badboy back into the highscore div! 
    $.getJSON("http://koaladash.com/app/getscores.php",function(data) {
        $.each(data, function(i,data) {
            var div_data = "<li>" + data.name + "-" + data.score + "</li>";
            $(div_data).appendTo("#high-score-list");
        });
    });
    return false;
}

function animate() {

    // request another animation frame
    if (continueAnimating) {
        requestAnimationFrame(animate);
    }
    else if (!continueAnimating && enemyScore == 4) {
        fetchScore();
    }

    // for each coin
    // (1) check for collisions
    // (2) advance the coin
    // (3) if the coin falls below the canvas, reset that coin
    for (var i = 0; i < coins.length; i++) {

        var coin = coins[i];
        // test for coin-koala collision
        if (isColliding(coin, koala)) {
            score++;
            resetcoin(coin);
        }
        // advance the coins
        coin.y -= coin.speed;
        // if the coin is below the canvas,
        if (coin.y < 1) {
            score--;
            resetcoin(coin);
        }
    }

    for (var i = 0; i < enemys.length; i++) {

        var enemy = enemys[i];

        // test for enemy-koala collision
        if (isColliding(enemy, koala)) {
            enemyScore++;
            resetenemy(enemy);
        }
        // advance the enemys
        enemy.y -= enemy.speed;
        // if the enemy is below the canvas,
        if (enemy.y < 1) {
            resetenemy(enemy);
        }
    }

    switch (enemyScore) {
        case 0:
            koala.y = 40;

        break;
        case 1:
            if (koala.y <= 80) {
                koala.y++;
            }
            $(".enemyfour").animate({ opacity: 0}, 500);
        break;
        case 2:
            if (koala.y <= 120) {
                koala.y++;
            }
             $(".enemythree").animate({ opacity: 0}, 500);
        break;
        case 3:
            if (koala.y <= 170) {
                koala.y++;
            }
             $(".enemytwo").animate({ opacity: 0}, 500);
        break;
        case 4:
            if (koala.y <= 500) {
                koala.y++;
            }
             $(".enemyone").animate({ opacity: 0}, 500);
            continueAnimating = false;
            stopWatch();
        break;
    }


    // redraw everything
    drawAll();

    if (score >= 0 && score <= 9) {
        $("h2 strong").html("0" + score);
    } else if (score >= 10 || score <= -1) {
        $("h2 strong").html(score);
    }

    var e = myWatch.getElapsed();

    if (e.minutes >= 0 && e.minutes <= 9) {
       var minutes = ("0" + e.minutes);
    } else if (e.minutes >= 10 || e.minutes <= -1) {
        var minutes = (e.minutes);
    }

    if (e.seconds >= 0 && e.seconds <= 9) {
        var seconds = ("0" + e.seconds);
    } else if (e.seconds >= 10 || e.seconds <= -1) {
        var seconds = (e.seconds);
    }

    $("h1 strong").html(minutes + ":" + seconds);

}

function isColliding(a, b) {
    return !(
        b.x > a.x + a.width || b.x + b.width < a.x || b.y > a.y + a.height || b.y + b.height < a.y);
}


function loadImages(sources, callback) {
    var images = {};
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for (var src in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

var sources = {
    koalaImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAA2CAYAAAC1ItuGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkI4RTZBODg5MUFEMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkI4RTZBODc5MUFEMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3M0E0QjhGRDhENTExMUU0QkZCQUYyRjBEN0Y1QUY1QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3M0E0QjhGRThENTExMUU0QkZCQUYyRjBEN0Y1QUY1QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnMJomIAAAyaSURBVHjazFkJbFTX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',
    coinImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkI4RTZBODQ5MUFEMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkI4RTZBODM5MUFEMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDQjVGRUQyNTgyMEExMUU0ODgzMzk1MzZGNjA2QjE0MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDQjVGRUQyNjgyMEExMUU0ODgzMzk1MzZGNjA2QjE0MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqbtSXUAAAcvSURBVHjanFdJjB1n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',
    enemyImg: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NTc3MiwgMjAxNC8wMS8xMy0xOTo0NDowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUE4MDk3MTM5MzZGMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUE4MDk3MTI5MzZGMTFFNEIxQTNBREEzMUQ4NjU0MEEiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKE1hY2ludG9zaCkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1QTgwOTcwRTkzNkYxMUU0QjFBM0FEQTMxRDg2NTQwQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1QTgwOTcwRjkzNkYxMUU0QjFBM0FEQTMxRDg2NTQwQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PsCu2aUAAAXtSURBVHja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'
};

var koalaCanvas = document.createElement('canvas');
var koalaContext = koalaCanvas.getContext('2d');
var coinCanvas = document.createElement('canvas');
var coinContext = coinCanvas.getContext('2d');
var enemyCanvas = document.createElement('canvas');
var enemyContext = enemyCanvas.getContext('2d');

switch (window.devicePixelRatio) {
    case 1:
        coinCanvas.width = 30;
        coinCanvas.height = 30;
        coinContext.scale(1, 1);
        koalaCanvas.width = 40;
        koalaCanvas.height = 54;
        koalaContext.scale(1, 1);
        enemyCanvas.width = 64;
        enemyCanvas.height = 32;
        enemyContext.scale(1, 1);
        break;
    case 2:
        coinCanvas.width = 60;
        coinCanvas.height = 60;
        coinContext.scale(2, 2);
        koalaCanvas.width = 80;
        koalaCanvas.height = 108;
        koalaContext.scale(2, 2);
        enemyCanvas.width = 128;
        enemyCanvas.height = 64;
        enemyContext.scale(2, 2);
        break;
    case 3:
        coinCanvas.width = 90;
        coinCanvas.height = 90;
        coinContext.scale(3, 3);
        koalaCanvas.width = 120;
        koalaCanvas.height = 162;
        koalaContext.scale(3, 3);
        enemyCanvas.width = 192;
        enemyCanvas.height = 96;
        enemyContext.scale(3, 3);
        break;
}

coinCanvas.style.width = "30px";
coinCanvas.style.height = "30px";
koalaCanvas.style.width = "40px";
koalaCanvas.style.height = "54px";
enemyCanvas.style.width = "64px";
enemyCanvas.style.height = "32px";

ctx.imageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
koalaContext.imageSmoothingEnabled = false;
koalaContext.mozImageSmoothingEnabled = false;
koalaContext.webkitImageSmoothingEnabled = false;
coinContext.imageSmoothingEnabled = false;
coinContext.mozImageSmoothingEnabled = false;
coinContext.webkitImageSmoothingEnabled = false;
enemyContext.imageSmoothingEnabled = false;
enemyContext.mozImageSmoothingEnabled = false;
enemyContext.webkitImageSmoothingEnabled = false;

loadImages(sources, function(images) {
    koalaContext.drawImage(images.koalaImg, 0, 0);
});

loadImages(sources, function(images) {
    coinContext.drawImage(images.coinImg, 0, 0);
});

loadImages(sources, function(images) {
    enemyContext.drawImage(images.enemyImg, 0, 0);
});

function drawAll() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw the koala
    ctx.drawImage(koalaCanvas, koala.x, koala.y, koala.width, koala.height);
    
    // draw all coins
    for (var i = 0; i < coins.length; i++) {
        var coin = coins[i];
        ctx.drawImage(coinCanvas, coin.x, coin.y, coin.width, coin.height);
    }

    // draw all enemys
    for (var i = 0; i < enemys.length; i++) {
        var enemy = enemys[i];
        ctx.drawImage(enemyCanvas, enemy.x, enemy.y, enemy.width, enemy.height);
    }

}

//Audio 
function sound(){
    
    var backgroundMusic = null; 
    var musicPlaying = false; 

    function playAudio(){

        function getPhoneGapPath() {
            var devicePlatform = device.platform;
            if (devicePlatform === "iOS") {
                path = "";
            } else if (devicePlatform === "Android" || devicePlatform === 'android') {
                path = "/android_asset/www/";
            }
            return path;
        };

        var backgroundMusic = new Media(getPhoneGapPath() + "audio/bg2.amr", success, error);
        
        function success(){
            backgroundMusic.release();
        }
        function error(e){
            alert(JSON.stringify(e));
        }

        if (!musicPlaying) {
            backgroundMusic.play();
            musicPlaying = true; 
            $(".audio-off").css('display', 'block');
            $(".audio-on").css('display', 'none');
        }
        else if (musicPlaying){
            backgroundMusic.stop();
            musicPlaying = false;
            $(".audio-on").css('display', 'block');
            $(".audio-off").css('display', 'none');
        };
    }

    $(".audio-on, .audio-off").on("touchstart", function() {
        playAudio();
    });

}

window.onload = function() {
        document.addEventListener("deviceready", onDeviceReady, false);
}


// Wait for device API libraries to load
//

function onDeviceReady(){
    $("#container").animate({ opacity: 1}, 500);
    $(".preload").css('display', 'none');


    sound();

    function showGame () {
        $(".play-button").on("touchstart", function() {
            $("#stage").css('display', 'block');
            setTimeout(function(){
                $("#stage, footer").animate({ opacity: 1}, 500);
                $("#intro").animate({ opacity: 0}, 500);
                setTimeout(function(){
                    startGame();
                    myWatch.start();
                    $("#intro").css('display', 'none');
                }, 1100)
            }, 500);
        });
    }

    $(".trophy-button").on("touchstart", function() {
        setTimeout(function(){
            $("#highscore-table").css('display', 'block');
            setTimeout(function(){
                $("#highscore-table").animate({ opacity: 1}, 500);
            }, 500);
        }, 500);

        $("#intro").animate({ opacity: 0}, 500);
        //get data back from the highscore database and post back into the highscore div
        $.getJSON("http://koaladash.com/app/getscores.php",function(data) {
            $.each(data, function(i,data) {
                var div_data = "<li>" + data.name + "-" + data.score + "</li>";
                $(div_data).appendTo("#high-score-list");
            });
        });
        return false;
    });
    
    $(".close-button").click(function() {
        location.reload(); 
    });


    $(".pause-button").click(function() {

        if (!app.paused) {
            myWatch.stop();
            app.paused = true;
            continueAnimating = false;
            stopWatch();
        }
        else if (app.paused) {
            myWatch.start();
            app.paused = false;
            continueAnimating = true;
            startWatch();
            animate();
        }

    });


    showGame();


}

function startGame() {

    score = startingScore;
    enemyScore = startingEnemyScore;

    koala.x = 0;

    for (var i = 0; i < coins.length; i++) {
        resetcoin(coins[i]);
    }

    for (var i = 0; i < enemys.length; i++) {
        resetenemy(enemys[i]);
    }

    if (!continueAnimating) {
        continueAnimating = true; 
        animate();
    };

    startWatch();
}

function startWatch() {
    app.watch = navigator.accelerometer.watchAcceleration(onSuccess, onFailure, {
        frequency: 1
    });
}

function stopWatch() {
    if (app.watch) {
        navigator.accelerometer.clearWatch(watch);
        app.watch = null;
    }
}

// onSuccess: Get a snapshot of the current acceleration
//
function onSuccess(accel) {

    var yTilt = accel.y / 10 * 90
    i = 1;

    if (yTilt <= -1) {
        koala.x -= koala.koalaSpeed;
        if (koala.x <= 0) {
            koala.x = 0;
        }
    } else if (yTilt >= 1) {
        koala.x += koala.koalaSpeed;
        if (koala.x >= 250) {
            koala.x = 250;
        }
    }

}

// onError: Failed to get the acceleration
//
function onFailure() {
    alert('onError!');
}



