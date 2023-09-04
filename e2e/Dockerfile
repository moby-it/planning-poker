

FROM mobyit/puppeteer-chrome-linux:stable 

ENV URL http://web:8080
RUN npm i -g pnpm@8.6.0

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

CMD [ "npm","test" ]