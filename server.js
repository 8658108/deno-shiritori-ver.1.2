 import { serve } from "https://deno.land/std@0.138.0/http/server.ts"
import { serveDir } from "https://deno.land/std@0.138.0/http/file_server.ts";

let previousWord = "しりとり";

const hiragana = await Deno.readTextFile("./public/hiragana.txt");
const katakana = await Deno.readTextFile("./public/katakana.txt");
const mark = await Deno.readTextFile("./public/mark.txt");

console.log("Listening on http://localhost:8000");
serve(async (req) => {
    const pathname=new URL(req.url).pathname;
    if(req.method === "GET" && pathname === "/shiritori"){
        return new Response(previousWord);
    }
    if(req.method === "POST" && pathname === "/shiritori"){
        const requestJson = await req.json();
        const nextWord = new String(requestJson.nextWord);
        let chkNWord = nextWord;
        if(previousWord.search("["+katakana+"]") >=0){
            for(let i=0;i<previousWord.length;i++){
                if((previousWord.charAt(i)).search("["+katakana+"]") >=0){
                    previousWord = previousWord.replace(previousWord.charAt(i),hiragana.charAt(katakana.search(previousWord.charAt(i))));
                    
                }
            }
        }
        if(chkNWord.length <= 0){
            return;
        }
        else if(chkNWord.search("["+hiragana+katakana+mark+"]") === -1){
            return new Response("ひらがな・カタカナ以外が含まれています。",{ status: 400 });
        }
        else if(chkNWord.search("[^"+mark+"]") === -1){
            return new Response("記号しかありません。", { status: 400 });
        }
        else if(chkNWord.search("["+katakana+"]") >=0){
            for(let i=0;i<chkNWord.length;i++){
                if((chkNWord.charAt(i)).search("["+katakana+"]") >=0){
                    chkNWord = chkNWord.replace(chkNWord.charAt(i),hiragana.charAt(katakana.search(chkNWord.charAt(i))));
                }
            }
        }
        
         if((previousWord.charAt(previousWord.length-1)).search("["+mark+"]") >= 0){
            previousWord = previousWord.replace(previousWord.charAt(previousWord.length-1),"");
        }

        if(chkNWord.charAt(chkNWord.length-1) === "ん"){
            return new Response("「ん」で終わっています。",{ status: 400 });
        }
        else if(hiragana.search(previousWord.charAt(previousWord.length-1)) >= hiragana.search("っ")){
            if(previousWord.charAt(previousWord.length-2) !== chkNWord.charAt(0)||previousWord.charAt(previousWord.length-1) !== chkNWord.charAt(1)){
                return new Response("前の単語に続いていません。",{ status: 400 });
            }
        }
        else if(hiragana.search(previousWord.charAt(previousWord.length-1))% 2 === 1){
            if(previousWord.charAt(previousWord.length-1) !== chkNWord.charAt(0)
                && hiragana.charAt(hiragana.search(previousWord.charAt(previousWord.length-1))-1) !== chkNWord.charAt(0)){
                return new Response("前の単語に続いていません。",{ status: 400 });
            }
        }
        else if(previousWord.charAt(previousWord.length-1) !== chkNWord.charAt(0)){
            return new Response("前の単語に続いていません。",{ status: 400 });
        }
        previousWord=nextWord;
        return new Response(previousWord);
    }

    return serveDir(req, {  
        fsRoot: "public",
        urlRoot: "",
        showDirListing: true,
        enableCors: true,
    });

});