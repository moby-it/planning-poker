

FROM mobyit/puppeteer-chrome-linux:stable 

ENV URL http://ui
RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

CMD [ "npm","test" ]