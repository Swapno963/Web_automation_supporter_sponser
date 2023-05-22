import PQueue from "p-queue";
import puppeteer from "puppeteer"; // importing puppter from pakage
import { setTimeout } from "timers/promises";

const browser = await puppeteer.launch({
    headless:false,
    defaultViewport:{width:1920,height:1080},
    userDataDir:"temporary",
});

const page = await browser.newPage();
await page.goto("https://duckduckgo.com/");

const searchButtonHandel = await page.waitForSelector('#searchbox_input')
await page.type('#searchbox_input','devconfbd')

await page.keyboard.press('Enter')

const firstResult = await page.waitForSelector('[data-testid="result-title-a"]')
firstResult.click()

await page.waitForSelector('.sponsors a, .supporter a');


const sponserLink = await page.evaluate(()=>{
    return [...document.querySelectorAll('.sponsors a')].map(e=>e.href)
})
const supporterLink = await page.evaluate(()=>{
    return [...document.querySelectorAll('.supporter a')].map(e=>e.href)
})
console.log({sponserLink,supporterLink});
await page.screenshot({path:"ducducgo.png"})

async function getLink(link){
    const page = await browser.newPage()
    await page.goto(link,{waitUntil:'networkidle2'})
    const title = await page.title()
    const hostname = await page.evaluate(()=>window.location.hostname)
    await page.screenshot({path:`${hostname}.png`})
    
    const facebookLink = await page.evaluate(()=>document.querySelector("a[href*=facebook]")?.href);

   const twteerLink = await page.evaluate(()=>document.querySelector("a[href*=twitter]")?.href);

    const linkdinLink = await page.evaluate(()=>document.querySelector("a[href*=linkedin]")?.href);

    const carrierLink = await page.evaluate(()=>document.querySelector("a[href*=career]")?.href);
   
    console.log({link,title,hostname,facebookLink,twteerLink,linkdinLink,carrierLink})
    page.close()
}

const queue = new PQueue({concurrency:2})
for(let link of supporterLink){
    queue.add(()=>getLink(link).catch(console.log))
}

await queue.onEmpty()
await browser.close()