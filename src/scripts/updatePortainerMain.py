from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os

load_dotenv()

site_login_inbcm = os.getenv("site_login_inbcm")
page_stacks_main = os.getenv("page_stacks_main")
userInbcm = os.getenv("userInbcm")
pwd = os.getenv("pwd")


with sync_playwright() as p:
    navegador = p.chromium.launch()
    pagina = navegador.new_page()
    pagina.goto(site_login_inbcm)
    pagina.fill('xpath=//*[@id="username"]',userInbcm)
    pagina.fill('xpath=//*[@id="password"]',pwd)
    pagina.click('xpath=//*[@id="view"]/div/div/div/div[3]/div/form/div[4]/div/button') #Button login
    pagina.wait_for_load_state("networkidle")
    pagina.goto(page_stacks_main)
    pagina.wait_for_load_state("networkidle")
    pagina.locator('a:has-text("Editor")').click()
    pagina.wait_for_load_state("networkidle")
    pagina.click('xpath=//*[@id="view"]/div[1]/div/rd-widget/div/rd-widget-body/div/div/div/div/div[2]/form/div[5]/div[2]/div/button') #Click button update
    pagina.wait_for_load_state("networkidle")
    pagina.click('xpath=/html/body/div[2]/div/div/div[3]/button[2]') #Click update