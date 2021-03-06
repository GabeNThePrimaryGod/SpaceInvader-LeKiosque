class Player
{
    constructor () 
    {
        this.position = { x : 600, y : 790 };
        this.size = { h : 20, w : 100 };
        this.color = { r: 255, g: 255, b: 255, a: 255 };
        this.bullet = new Bullet();
    }
    
    draw ()
    {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b, this.color.a);
        rect(this.position.x - (this.size.w / 2), this.position.y - (this.size.h / 2),
             this.size.w, this.size.h);
        
        if(!this.bullet.isShooted)
        {
            this.bullet.position.x = this.position.x;
            this.bullet.position.y = this.position.y - this.size.h;
        }
        else
            this.bullet.shoot();

        this.bullet.draw();
    }
}

class Bullet
{
    constructor ()
    {
        this.position = { x : 0, y : 0 };
        this.size = { h : 20, w : 20 };
        this.color = { r: 0, g: 255, b:255, a: 255 };
        this.isShooted = false;
        this.shootSpeed = 10;
    }
    
    draw ()
    {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b, this.color.a);
        rect(this.position.x - (this.size.w / 2), this.position.y - (this.size.h / 2),
             this.size.w, this.size.h);
    }

    shoot ()
    {
        this.position.y -= this.shootSpeed;
    }
}

class Enemy 
{
    constructor () 
    {
        this.position = { x : 50, y : 50 };
        this.size = { h : 30, w : 30 };
        this.color = { r: 255, g: 0, b: 0, a: 255 };
        this.isDead = false;
    }
    
    draw ()
    {
        noStroke();
        fill(this.color.r, this.color.g, this.color.b, this.color.a);
        rect(this.position.x - (this.size.w / 2), this.position.y - (this.size.h / 2),
             this.size.w, this.size.h);
    }
}

class LevelsManager
{
    constructor()
    {
        this.currentRound = 0;

        this.enemysLines = 2;
        this.enemysColumns = 5;
        this.enemysXSpeed = 5;
        this.enemysYSpeed = 5;
        this.enemys = [];
    }
    
    loadNextRound()
    {
        if(document.getElementById('round-text').innerHTML != null)
            document.getElementById('round-text').innerHTML = "Round : " + this.currentRound;
        
        this.enemys = [];

        // o k ou
        if(this.enemysXSpeed < 0) this.enemysXSpeed = -this.enemysXSpeed;
        if(this.enemysYSpeed < 0) this.enemysYSpeed = -this.enemysYSpeed;

        this.enemysXSpeed += this.currentRound;
        this.enemysYSpeed += this.currentRound * 2;

        player.bullet.shootSpeed += this.currentRound;
    
        for(let line = 0; line < this.enemysLines; line++)
        {
            const enemyLine = [];
            for(let column = 0; column < this.enemysColumns; column++)
            {
                const enemy = new Enemy();
                enemy.position.x += column * (enemy.size.w * 2);
                enemy.position.y += line * (enemy.size.h * 2);
                enemyLine.push(enemy);
            }
            this.enemys.push(enemyLine);
        }
        
        this.currentRound++;
    }

    isEveryoneDead()
    {
        let enemysCount = levelsManager.enemysColumns * levelsManager.enemysLines;
        let deadCount = 0;

        for(let enemyLine of levelsManager.enemys)
            for(let enemy of enemyLine)
                if(enemy.isDead) deadCount++;

        if(enemysCount == deadCount)
            return true;
        return false;
    }
}

const windowSize = { w : 1200, h : 800 };

let levelsManager = new LevelsManager();
let player = new Player();

let isGamePause = false;

function Restart()
{
    levelsManager = new LevelsManager();
    player = new Player();
    levelsManager.loadNextRound();
    isGamePause = false;
}

function setup()
{
    createCanvas(windowSize.w, windowSize.h);
    levelsManager.loadNextRound();
}

function draw()
{
    if(isGamePause)
        return;

    background(0, 0, 0, 100);

    for(enemyLine of levelsManager.enemys)
    {
        for(enemy of enemyLine)
        {
            if(!enemy.isDead)
            {
                enemy.draw();
                enemy.position.x += levelsManager.enemysXSpeed;
                
                if(isHitBorder(enemy))
                {
                    for(enemyLine of levelsManager.enemys)
                        for(enemy of enemyLine)
                            enemy.position.y += levelsManager.enemysYSpeed;
                    
                        levelsManager.enemysXSpeed = -levelsManager.enemysXSpeed
                }
                
                if(isHitObject(player.bullet, enemy))
                {
                    if(player.bullet.isShooted)
                    {
                        enemy.isDead = true;
                        player.bullet.isShooted = false;
                    }
                    else
                        isGamePause = true;

                    if(levelsManager.isEveryoneDead())
                        levelsManager.loadNextRound();
                }
            }
        }
    }
    
    if(isHitBorder(player.bullet))
        player.bullet.isShooted = false;
    
    player.position.x = mouseX;
    isHitBorder(player);
    player.draw();
}

function mouseClicked()
{
    player.bullet.isShooted = true;
}

function isHitObject(object1, object2)
{
    if (object1.position.x + object1.size.w >= object2.position.x &&
        object1.position.x <= object2.position.x + object2.size.w &&
        object1.position.y + object1.size.h >= object2.position.y &&
        object1.position.y <= object2.position.y + object2.size.h) 
        return true;
    return false;
}

function isHitBorder(object)
{
    if(object.position.x + object.size.w / 2 > windowSize.w)
    {
        object.position.x = windowSize.w - object.size.w / 2 ;
        return true;
    }
    if(object.position.x - object.size.w / 2 < 0)
    {
        object.position.x = object.size.w / 2;
        return true;
    }
    if(object.position.y + object.size.h / 2 > windowSize.h)
    {
        object.position.y = windowSize.h - object.size.h / 2;
        return true;    
    }
    if(object.position.y - object.size.h / 2 < 0)
    {
        object.position.y = object.size.h / 2;
        return true;
    }
    return false;
}