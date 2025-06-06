import { padMarkdown } from '../../src/transformers/pad-markdown'

describe('padding()', () => {
  describe('inline code', () => {
    it('should pad between inline code', () => {
      expect(padMarkdown('file`/foo.txt`not exists'))
        .toEqual('file `/foo.txt` not exists')
    })
    it('should pad between triple tick inline code', () => {
      expect(padMarkdown('```foo```\nfile```/foo.txt```not exists'))
        .toEqual('```foo```\nfile ```/foo.txt``` not exists')
    })
    it('should ignore padded code fence', () => {
      expect(padMarkdown('file `/foo.txt` not exists'))
        .toEqual('file `/foo.txt` not exists')
    })
  })

  describe('code fences', () => {
    it('should not pad comment if language not specified', () => {
      const input = 'sample: \n```\nint a ; // X11就很好\nint  b;\n```'
      const output = 'sample: \n```\nint a ; // X11就很好\nint  b;\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should not pad string in JavaScript', () => {
      const input = "```javascript\nlet s = 'https://google.com?q=天气'```"
      const output = "```javascript\nlet s = 'https://google.com?q=天气'```"
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should pad line comment in cpp', () => {
      const input = 'sample: \n```cpp\nint a ; // X11就很好\nint  b;\n```'
      const output = 'sample: \n```cpp\nint a ; // X11 就很好\nint  b;\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should pad block comment in javascript', () => {
      const input = 'sample: \n```javascript\nwindow.alert(1) ; /* X11就很好\nrefer to<http://x11.org>.*/var  b;\n```'
      const output = 'sample: \n```javascript\nwindow.alert(1) ; /* X11 就很好\nrefer to <http://x11.org>.*/var  b;\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should pad jsdom comment in javascript', () => {
      const input = 'sample: \n```javascript\n/**\n * @param {string} s 字符串s\n * @return {string}\n */\nvar longestPalindrome = function(s) {}\n```'
      const output = 'sample: \n```javascript\n/**\n * @param {string} s 字符串 s\n * @return {string}\n */\nvar longestPalindrome = function(s) {}\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should pad line comment in sql', () => {
      const input = 'sample: \n```sql\nSELECT * FROM USER; -- 查找所有USER\n```'
      const output = 'sample: \n```sql\nSELECT * FROM USER; -- 查找所有 USER\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should pad block comment in bash', () => {
      const input = 'sample: \n```bash\necho X11就很好 # X11就很好\n```'
      const output = 'sample: \n```bash\necho X11就很好 # X11 就很好\n```'
      expect(padMarkdown(input)).toEqual(output)
    })
    it('should not delete sharp comment', () => {
      const input = '```sh\n# abc\n```'
      expect(padMarkdown(input)).toEqual(input)
    })
  })

  describe('math', () => {
    it('should recognize $inline math$', () => {
      const src = '其实就类似我们学过的科学计数法，其一般形式为$N = S*r^j$，其中$S$称为**尾数**，$j$称为**阶码**，$r$称为**基值**。'
      const dst = '其实就类似我们学过的科学计数法，其一般形式为 $N = S*r^j$，其中 $S$ 称为 **尾数**，$j$ 称为 **阶码**，$r$ 称为 **基值**。'
      expect(padMarkdown(src)).toEqual(dst)
    })
  })

  describe('front matter', () => {
    it('should recognize Jekyll-style front matter', () => {
      const src = '---date: 2022-08-08 23:53:07\n---\n这是一个demo'
      const dst = '---date: 2022-08-08 23:53:07\n---\n这是一个 demo'
      expect(padMarkdown(src)).toEqual(dst)
    })
    it('should restrict front matter in the beginning of file', () => {
      const src = 'd ---date: 2022-08-08 23:53:07\n---\n这是一个demo'
      const dst = 'd ---date: 2022-08-08 23:53:07\n---\n这是一个 demo'
      expect(padMarkdown(src)).toEqual(dst)
    })
    it('should allow empty spaces before front matter', () => {
      const src = ' \n ---date: 2022-08-08 23:53:07\n---\n这是一个demo'
      const dst = ' \n ---date: 2022-08-08 23:53:07\n---\n这是一个 demo'
      expect(padMarkdown(src)).toEqual(dst)
    })
  })

  describe('mixed with zh', () => {
    it('should pad between zh_CN and en_US', () => {
      expect(padMarkdown('我是Yang先生'))
        .toEqual('我是 Yang 先生')
    })
    it('should ignore padded zh_CN/en_US border', () => {
      expect(padMarkdown('我是 Yang 先生'))
        .toEqual('我是 Yang 先生')
    })
    it('should pad between zh_CN and numbers', () => {
      expect(padMarkdown('X11就很好'))
        .toEqual('X11 就很好')
    })
    it('should not pad unicode icons', () => {
      expect(padMarkdown('a©®♣♥11♠♩♪♫a')).toEqual('a©®♣♥11♠♩♪♫a')
    })
    it('should not pad Spanish chars', () => {
      const text = '* Gonzalo Maeso, D., 1971, “La Judería de Soria y el Rabino José Albo”, *Misceláneade Estudios Arabes y Hebraicos*, 20 (2): 119–141.'
      expect(padMarkdown(text)).toEqual(text)
    })
  })

  describe('options', () => {
    it('should support ignore list', () => {
      const src = '卧C'
      expect(padMarkdown(src)).toEqual('卧 C')
      expect(padMarkdown(src, { ignoreWords: ['卧C'] })).toEqual('卧C')
    })
    it('should support ignore list in code block', () => {
      const src = '```cpp\n//卧C\n```'
      expect(padMarkdown(src)).toEqual('```cpp\n//卧 C\n```')
      expect(padMarkdown(src, { ignoreWords: ['卧C'] })).toEqual('```cpp\n//卧C\n```')
    })
    it('should support punct as ignore word', () => {
      const src = 'a:b'
      expect(padMarkdown(src)).toEqual('a: b')
      expect(padMarkdown(src, { ignoreWords: [':'] })).toEqual('a:b')
    })
    it('should ignore multiple ignored occurrences', () => {
      const src = '1:2::2:1'
      expect(padMarkdown(src)).toEqual('1:2:: 2:1')
      expect(padMarkdown(src, { ignoreWords: [':'] })).toEqual('1:2::2:1')
    })
    it('should support ignore patterns', () => {
      const src = 'begin{%if bar="BAR"%}true{%endif%}end'
      expect(padMarkdown(src)).toEqual('begin{%if bar = "BAR"%}true{%endif%}end')
      expect(padMarkdown(src, { ignorePatterns: ['{%.+%}'] })).toEqual('begin{%if bar="BAR"%}true{%endif%}end')
    })
    it('should support multiple ignore patterns', () => {
      const src = 'begin{%if bar="BAR"%}true{%endif%}end'
      expect(padMarkdown(src)).toEqual('begin{%if bar = "BAR"%}true{%endif%}end')
      expect(padMarkdown(src, { ignorePatterns: ['{%if.+%}', '{%endif%}'] })).toEqual('begin{%if bar="BAR"%}true{%endif%}end')
    })
    it('should support multiple ignore patterns for nunjucks', () => {
      const src = `
        {% codeblock title lang:c line_number:true highlight:true %}
        我的code
        {% endcodeblock %}
      `
      expect(padMarkdown(src)).toEqual(`
        {% codeblock title lang: c line_number: true highlight: true %}
        我的 code
        {% endcodeblock %}
      `)
      expect(padMarkdown(src, { ignorePatterns: ['{%.+%}'] })).toEqual(`
        {% codeblock title lang:c line_number:true highlight:true %}
        我的 code
        {% endcodeblock %}
      `)
    })
    it('should support patterns after UnorderedListItem', () => {
      const src = '- <u>123</u>\n- <u>456</u>'
      expect(padMarkdown(src, { ignorePatterns: ['<u>.+?</u>'] })).toEqual(src)
    })
    it('should support tow pattern matches in same line', () => {
      const src = '<u>前</u>**中**后'
      const ignorePatterns = ['<u>.+?</u>', '\\*\\*.+?\\*\\*']
      expect(padMarkdown(src, { ignorePatterns })).toEqual(src)
    })
    it('should support ignorePatterns inside code fences', () => {
      const src = '```html\n<br/>\nlet a=3;```\nfoo'
      const ignorePatterns = ['<br/>']
      expect(padMarkdown(src, { ignorePatterns })).toEqual(src)
    })
  })

  describe('emphasis, strong, strikethrough', () => {
    it('should maintain space between text and emphasis', () => {
      expect(padMarkdown('what should be _emphasised_ is'))
        .toEqual('what should be _emphasised_ is')
    })
    it('should add space between text and strong', () => {
      expect(padMarkdown('this is**important**.'))
        .toEqual('this is **important**.')
    })
    it('should add space between text and strikethrough', () => {
      expect(padMarkdown("I can't do~~this~~anymore."))
        .toEqual("I can't do ~~this~~ anymore.")
    })
  })

  describe('links', () => {
    it('should pad between footnote links', () => {
      expect(padMarkdown('refer to[foo][bar]please'))
        .toEqual('refer to [foo][bar] please')
    })
    it('should pad between inline links', () => {
      expect(padMarkdown('refer to[foo](http://foo)please'))
        .toEqual('refer to [foo](http://foo) please')
    })
    it('should pad between bare links', () => {
      expect(padMarkdown('refer to<http://foo>please'))
        .toEqual('refer to <http://foo> please')
    })
    it('should not pad inside link urls', () => {
      expect(padMarkdown('[foo](http://example.com?foo=**bar**)'))
        .toEqual('[foo](http://example.com?foo=**bar**)')
    })
    it('should pad strong inside link text', () => {
      expect(padMarkdown('refer to [this is**important**](http://example.com)'))
        .toEqual('refer to [this is **important**](http://example.com)')
    })
  })

  describe('images', () => {
    it('should pad between footnote links', () => {
      expect(padMarkdown('refer to![foo][bar]please'))
        .toEqual('refer to ![foo][bar] please')
    })
    it('should pad between inline links', () => {
      expect(padMarkdown('refer to![foo](http://foo)please'))
        .toEqual('refer to ![foo](http://foo) please')
    })
    it('should not pad inside link urls', () => {
      expect(padMarkdown('![foo](http://example.com?foo=**bar**)'))
        .toEqual('![foo](http://example.com?foo=**bar**)')
    })
    it('should pad strong inside alt text', () => {
      expect(padMarkdown('refer to ![this is**important**](http://example.com)'))
        .toEqual('refer to ![this is **important**](http://example.com)')
    })
    it('should not pad inside inline image attributes', () => {
      expect(padMarkdown('![ ](test.png){width=8cm}'))
        .toEqual('![ ](test.png){width=8cm}')
    })
    it('should not pad inside reference image attributes', () => {
      expect(padMarkdown('![ ][img]{width=8cm}'))
        .toEqual('![ ][img]{width=8cm}')
    })
  })

  describe('punctuations', () => {
    it('should not pad on full-width punctuations', () => {
      expect(padMarkdown('a，b""。c'))
        .toEqual('a，b ""。c')
    })
    it('should not pad between link and comma', () => {
      expect(padMarkdown('refer to <http://foo>,'))
        .toEqual('refer to <http://foo>,')
    })
    it('should not pad colon when used with numbers', () => {
      expect(padMarkdown('今天的比分是1:1')).toEqual('今天的比分是 1:1')
    })
    it('should not pad middle dot', () => {
      expect(padMarkdown('《庄子·天下篇》')).toEqual('《庄子·天下篇》')
    })
    it('should not pad between non-ascii and comman', () => {
      expect(padMarkdown('不要信任终端用浅色背景的人,'))
        .toEqual('不要信任终端用浅色背景的人,')
    })
    it('should pad between numbers and comma', () => {
      expect(padMarkdown('a total of 2,000,000 people'))
        .toEqual('a total of 2,000,000 people')
    })
    it('should not pad between puncs', () => {
      expect(padMarkdown('...,,/:!')).toEqual('...,,/:!')
    })
    it('should pad between numbers and dots', () => {
      expect(padMarkdown('version 2.2.3')).toEqual('version 2.2.3')
    })
    it('should not pad on single quote', () => {
      expect(padMarkdown("dont't you leave me alone"))
        .toEqual("dont't you leave me alone")
    })
    it('should not pad around "_"', () => {
      expect(padMarkdown('a_single_word')).toEqual('a_single_word')
    })
    it('should not pad before "？"', () => {
      expect(padMarkdown("what's this？")).toEqual("what's this？")
      expect(padMarkdown('X11？')).toEqual('X11？')
    })
    it('should not pad before "！"', () => {
      expect(padMarkdown('see here！')).toEqual('see here！')
      expect(padMarkdown('X11！')).toEqual('X11！')
    })
    it('should not pad before "；"', () => {
      expect(padMarkdown('item1；')).toEqual('item1；')
      expect(padMarkdown('`code`；')).toEqual('`code`；')
    })
    it('should pad around >', () => {
      expect(padMarkdown('a>b')).toEqual('a > b')
    })
    it('should pad around <', () => {
      expect(padMarkdown('a<b')).toEqual('a < b')
    })
    it('should pad around =', () => {
      expect(padMarkdown('a=b')).toEqual('a = b')
    })
  })
  describe('compatible to markdown plugins', () => {
    it('should be compatible to vscode MPE plugin', () => {
      const input = '@import "image.png" {width="300px" alt="image"}'
      expect(padMarkdown(input)).toEqual(input)
    })
    it('should be compatible to vscode MPE plugin (multiline)', () => {
      const input = '@import "image.png" {width="300px" alt="image"}\nfoo=bar'
      const output = '@import "image.png" {width="300px" alt="image"}\nfoo = bar'
      expect(padMarkdown(input)).toEqual(output)
    })
  })
  describe('escape', () => {
    it('should allow \\ escape *', () => {
      expect(padMarkdown('*foo*bar')).toEqual('*foo* bar')
      expect(padMarkdown('foo*bar')).toEqual('foo*bar')
      expect(padMarkdown('\\*foo\\*bar')).toEqual('\\*foo\\*bar')
    })
  })
})
