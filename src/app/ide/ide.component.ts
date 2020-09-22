import { Component, Directive, OnInit, ViewChild, ElementRef, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { Input } from '@angular/core'
import * as ace from 'ace-builds'; // ace-module
import { languageModuleMap } from './consts/language-module-table';
import { Language } from 'src/models/languages/languages';
import { themeModuleMap } from './consts/theme-module-table';
import { ServerHandlerService } from '../services/http/server-handler.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { MaterialComponentService } from '../services/material-component.service';

// Reference: https://github.com/judge0/ide/blob/master/js/ide.js
function encode(str) {
  return btoa(unescape(encodeURIComponent(str || "")));
}

function decode(bytes) {
  var escaped = escape(atob(bytes || ""));
  try {
      return decodeURIComponent(escaped);
  } catch {
      return unescape(escaped);
  }
}

import {
  DEFAULT_INIT_EDITOR_OPTIONS,
  DEFAULT_SUPPORTED_EDITOR_THEMES,
  DEFAULT_RUN_ERROR_MESSAGE
} from './consts/default-options';

// import webpack resolver to dynamically load modes and themes
import 'ace-builds/webpack-resolver';

import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/ext-beautify';
import { LanguageTable } from './consts/language-table';
let DEF_HEADER_CPP = '// header code\n';
let DEF_CONTENT_CPP = `#include <iostream>
using namespace std;

int main () {
    
    cout << "hello world";
    return 0;
}`;
let DEF_FOOTER_CPP = '// footer code';

let INIT_HEADER_CPP = '// header code\n';
let INIT_HEADER_JAVA = '// header code\n';
let INIT_HEADER_PY = '# header code\n';
let INIT_CONTENT_CPP = `#include <iostream>
using namespace std;

int main () {
    
    cout << "hello world";
    return 0;
}`;
let INIT_CONTENT_PY = `print('hello world')`;
let INIT_CONTENT_JAVA = `class Main {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
};`;
let INIT_FOOTER_CPP = '// footer code';
let INIT_FOOTER_JAVA = '// footer code';
let INIT_FOOTER_PY = '# footer code';
let DEFAULT_THEME_MODE = 'solarized_dark';
let DEFAULT_LANG_MODE = 'cpp14';

@Component({
  selector: 'app-ide',
  templateUrl: './ide.component.html',
  styleUrls: ['./ide.component.css']
})
export class IdeComponent implements OnInit {

  @ViewChild('codeEditor', {static: true}) private codeEditorElmRef: ElementRef;
  @ViewChild('codeEditorHeader', {static: true}) private codeEditorHeadElmRef: ElementRef;
  @ViewChild('codeEditorFooter', {static: true}) private codeEditorFootElmRef: ElementRef;
  // language select element ref
  @ViewChild('languagesSelect', {static: false}) languagesSelect: ElementRef;
  // input
  @ViewChild('sampleInput', {static: true}) myInput: ElementRef;
  // observable of the run request output
  public output$: Observable<string>;
  // current editor theme name
  public activatedTheme: string;
  public running: boolean;
  public codeHeaderPresent: boolean;
  public codeFooterPresent: boolean;
  private codeEditor: ace.Ace.Editor;
  private codeHeader: ace.Ace.Editor;
  private codeFooter: ace.Ace.Editor;
  private editorBeautify;
  
  // @Input() content: string;
  @Input() initOptions: {
    languageMode?: string, theme?: string, content?: string
  } = { };
  private currentConfig: {
    langMode?: string, editorTheme?: string
  } = { };

  public initEditorOptions = DEFAULT_INIT_EDITOR_OPTIONS;
  public supportedThemes = DEFAULT_SUPPORTED_EDITOR_THEMES;

  // indicate if the initial langauges API request failed or not
  public cantReachServer = false;
  // array of the supported languages
  private languagesArray: Language[] = [];
  // observable of the supported languages
  public languagesArray$: Observable<Language[]>;
  showSpinner: Boolean = false; 
  constructor(private handler: ServerHandlerService,
              private cd: ChangeDetectorRef,
              private matComp: MaterialComponentService
              ) { }

  // input from parent component
  @Input('headerCode') headerCode: string;
  @Input('footerCode') footerCode: string;
  @Input('mainCode') mainCode: string;
  @Input('problemInput') problemInput: string;

  async ngOnInit() {
    ace.require('ace/ext/language_tools');
    const editorMain = this.codeEditorElmRef.nativeElement;
    const editorOptions = this.getEditorOptions();
    this.codeEditor = ace.edit(editorMain, editorOptions);

    this.setLanguageMode(this.initOptions.languageMode || DEFAULT_LANG_MODE);
    this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME_MODE);
    this.setContent(this.initOptions.content || INIT_CONTENT_CPP);

    this.editorBeautify = ace.require('ace/ext/beautify');
    this.languagesArray$ = this.pipeSupportedLanguages();
    this.activatedTheme = this.initEditorOptions.theme;

    this.codeEditor.clearSelection();

    this.codeEditor.on("change", (delta) => {
      const content = this.codeEditor.getValue();
      let linesInContent = content.split(/\r\n|\r|\n/).length;
      let linesInHeader = 0;
      if (this.codeHeader) {
        linesInHeader = this.codeHeader.getValue().split(/\r\n|\r|\n/).length;
      }
      if (this.codeFooter) {
        this.codeFooter.setOption("firstLineNumber", linesInHeader + linesInContent + 1);
      }
    });

  }

  async ngAfterViewInit() {
    this.cantReachServer = false;
    this.cd.detectChanges();
    await this.ngOnChanges();
  }
  
  async ngOnChanges() {
    const editorOptions = this.getEditorOptions();
    // update header code, footer code, initial content
    if (this.headerCode != null && this.headerCode != "") {
      INIT_HEADER_CPP = this.headerCode;
      this.codeHeaderPresent = true;
      const header = this.codeEditorHeadElmRef.nativeElement;
      this.codeHeader = ace.edit(header, editorOptions);
      this.codeHeader.setReadOnly(true);
      this.codeHeader.setHighlightActiveLine(false);
    } else {
      this.codeHeaderPresent = false;
      INIT_HEADER_CPP = DEF_HEADER_CPP;
    }
    if (this.footerCode != null && this.footerCode != "") {
      this.codeFooterPresent = true;
      INIT_FOOTER_CPP = this.footerCode;
      const footer = this.codeEditorFootElmRef.nativeElement;
      this.codeFooter = ace.edit(footer, editorOptions);
      this.codeFooter.setReadOnly(true);
      this.codeFooter.setHighlightActiveLine(false);
    } else {
      this.codeFooterPresent = false;
      INIT_FOOTER_CPP = DEF_FOOTER_CPP;
    }
    if (this.mainCode != null) {
      INIT_CONTENT_CPP = this.mainCode;
    } else {
      INIT_CONTENT_CPP = DEF_CONTENT_CPP;
    }
    this.setLanguageMode(this.initOptions.languageMode || DEFAULT_LANG_MODE);
    this.setEditorTheme(this.initOptions.theme || DEFAULT_THEME_MODE);
    this.setContent(INIT_CONTENT_CPP);
    this.activatedTheme = this.initEditorOptions.theme;
    // sample input
    if (this.problemInput != null) {
      this.myInput.nativeElement.value = this.problemInput;
    } else {
      this.myInput.nativeElement.value = "";
    }
    // sample output
    this.output$ = Observable.create((observer) => { observer.next(''); });
  }
  
  private pipeSupportedLanguages() {
    return this.handler.getAllSupportedLangs()
    .pipe(
      // reduce the incoming table to languages array
      map((languages: LanguageTable) => {
        var res = Array<Language>();
        var languagesNew = <Array<any>>languages;
        for (var i = 0; i < languagesNew.length; ++i) {
          res.push(languagesNew[i][1][0]);
        }
        return res;
      }),
      // store the array in a member
      tap((languages: Language[]) => this.languagesArray = languages),
      // console log any error 
      catchError((err) => {
        this.matComp.openSnackBar(err['statusText'],2000);
        this.cantReachServer = true;
        this.languagesArray = [];
        return of(this.languagesArray);
      })
    );
  }
  private getEditorOptions(): Partial<ace.Ace.EditorOptions> & { enableBasicAutoCompletion?: boolean;} {
    const basicEditorOptions: Partial<ace.Ace.EditorOptions> = {
      highlightActiveLine: true,
      minLines: 7,
      maxLines: 20,
      fontSize: 18,
      autoScrollEditorIntoView: true,
      vScrollBarAlwaysVisible: true
    }
    const extraEditorOptions = {
      enableBasicAutocompletion: true,
    };
    const mergedOptions = Object.assign(basicEditorOptions, extraEditorOptions);
    return mergedOptions;
  }

  /**
   * 
   * @param langMode - set as the editor's language, currentConfig.langMode
   */
  
  public setLanguageMode(langMode: string): void {
    try {
      if (languageModuleMap.has(langMode)) {
        const languageModulePath = languageModuleMap.get(langMode);
        this.codeEditor.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
          if (langMode == 'cpp14') {
            this.codeEditor.setValue(INIT_CONTENT_CPP);
            if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_CPP);
            if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_CPP);
          } else if (langMode == 'java') {
            this.codeEditor.setValue(INIT_CONTENT_JAVA);
            if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_JAVA);
            if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_JAVA);
          } else if (langMode == 'python3') {
            this.codeEditor.setValue(INIT_CONTENT_PY);
            if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_PY);
            if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_PY);
          }
          this.codeEditor.clearSelection();
        });
        if (this.codeHeader) this.codeHeader.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
        if (this.codeFooter) this.codeFooter.getSession().setMode(languageModulePath, () => {
          this.currentConfig.langMode = langMode;
        });
      }
    } catch (error) {
      this.matComp.openSnackBar(error['statusText'],2000);
    }
  }

  /**
   * 
   * @param theme - set as the editor's theme, currentConfig.editorTheme
   */
  public setEditorTheme(theme: string): void {
    try {
      if (themeModuleMap.has(theme)) {
        const themePath = themeModuleMap.get(theme);
        this.codeEditor.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
        if (this.codeHeader) this.codeHeader.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
        if (this.codeFooter) this.codeFooter.setTheme(themePath, () => {
          this.currentConfig.editorTheme = theme;
        });
      }
    } catch (error) {
      this.matComp.openSnackBar(error['statusText'],2000);
    }
  }

  public getCurrentConfig(): Readonly<{langMode?: string; editorTheme?: string;}> {
    return Object.freeze(this.currentConfig);
  }

  /**
   * @description
   * beautify the editor content, relies on Ace Beautify extension
   */
  public onBeautifyContent() {
    if (this.codeEditor && this.editorBeautify) {
      const session = this.codeEditor.getSession();
      this.editorBeautify.beautify(session);
    }
  }

  /**
   * @returns - the current editor's content.
   */
  public getContent() {
    if (this.codeHeader && this.codeEditor && this.codeFooter) {
      const code = this.codeHeader.getValue() + "\n" + this.codeEditor.getValue() + "\n" + this.codeFooter.getValue();
      return code;
    } else if (this.codeHeader && this.codeEditor) {
      const code = this.codeHeader.getValue() + "\n" + this.codeEditor.getValue();
      return code;
    } else if (this.codeEditor && this.codeFooter) {
      const code = this.codeEditor.getValue() + "\n" + this.codeFooter.getValue();
      return code;
    } else {
      const code = this.codeEditor.getValue();
      return code;
    }
  }

  /**
   * @description
   * clears the editor content.
   */
  public onClearContent() {
    if (this.codeEditor) {
      if (this.currentConfig.langMode == 'cpp14') {
        this.codeEditor.setValue(INIT_CONTENT_CPP);
        if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_CPP);
        if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_CPP);
      } else if (this.currentConfig.langMode == 'java') {
        this.codeEditor.setValue(INIT_CONTENT_JAVA);
        if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_JAVA);
        if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_JAVA);
      } else if (this.currentConfig.langMode == 'python3') {
        this.codeEditor.setValue(INIT_CONTENT_PY);
        if (this.codeHeader) this.codeHeader.setValue(INIT_HEADER_PY);
        if (this.codeFooter) this.codeFooter.setValue(INIT_FOOTER_PY);
      }
      this.codeEditor.clearSelection();
    }
    // test input value
    let input = this.myInput.nativeElement.value;
  }

  /**
   * @param content - set as the editor's content.
   */
  public setContent(content: string) : void {
    if (this.codeEditor) {
      this.codeEditor.setValue(content);
    }
    if (this.codeHeader) {
      this.codeHeader.setValue(INIT_HEADER_CPP);
    }
    if (this.codeFooter) {
      this.codeFooter.setValue(INIT_FOOTER_CPP);
    }

    // set line numbers appropriately
    let linesInHeader = 0;
    if (this.codeHeader) linesInHeader = this.codeHeader.getValue().split(/\r\n|\r|\n/).length;
    if (this.codeEditor) this.codeEditor.setOption("firstLineNumber", linesInHeader + 1);
    let linesInContent = 0;
    if (this.codeEditor) linesInContent = this.codeEditor.getValue().split(/\r\n|\r|\n/).length;
    let initialLinesFooter = linesInHeader + linesInContent + 1;
    if (this.codeFooter) this.codeFooter.setOption("firstLineNumber", initialLinesFooter)
  }

  /**
   * @event OnContentChange - a proxy event to Ace 'change' event - adding additional data.
   * @param callback - receive the current content and 'change' event's original parameter.
   */
  public onContentChange(callback: (content: string, delta: ace.Ace.Delta) => void) : void {
    this.codeEditor.on('change', (delta) => {
      const content = this.codeEditor.getValue();
      let linesInContent = content.split(/\r\n|\r|\n/).length;
      this.codeFooter.setOption("firstLineNumber", linesInContent + 1);
      callback(content, delta);
    });
  }

  public onChangeTheme(theme: string) {
    if (this.supportedThemes.includes(theme)) {
      this.setEditorTheme(theme);
    }
  }

  public onChangeLanguageMode(event: any) {
    const selectedIndex = event.target.selectedIndex;
    const language = this.languagesArray[selectedIndex];
    const langMode = language.lang;
    this.setLanguageMode(langMode);
  }

  public getLangId() {
    const languagesSelectElement = this.languagesSelect.nativeElement as HTMLSelectElement;
    const index = languagesSelectElement.selectedIndex;
    const language = this.languagesArray[index];
    return language.lang;
  }

  public getLangVersion() {
    const languagesSelectElement = this.languagesSelect.nativeElement as HTMLSelectElement;
    const index = languagesSelectElement.selectedIndex;
    const language = this.languagesArray[index];
    return language.version;
  }
  public onRunCode() {
    this.running = true;
    const code = encode(this.getContent());
    const input = encode(this.myInput.nativeElement.value);
    let fields = "stdout,time,memory,compile_output,stderr,token,message,status";
    if (this.languagesSelect && code.length > 0) {
      const langId = this.getLangId();
      const langVersion = this.getLangVersion();
      this.output$ = this.handler.postCodeToRun(code, {
        id: langId, version: langVersion
      }, input, fields).pipe(
        // returning the output content
        map((response: RunResult) => {
          this.running = false;
          if (response.compile_output != null) {
            return decode(response.compile_output);
          } else if (response.stderr != null) {
            return decode(response.stderr);
          }
          return decode(response.stdout);
        }),
        catchError((err) => {
          this.running = false;
          this.matComp.openSnackBar(err['statusText'],2000);
          return of(DEFAULT_RUN_ERROR_MESSAGE);
        })
      );
    }
  }
  //for upload button
  
 
 public clickUploadButton() {
   document.getElementById('getFile').click();
   this.codeEditor.setValue('');
   var pastingCode=(textVal)=>
   {
     this.codeEditor.setValue(textVal)
   }
   document.getElementById("getFile").addEventListener('change',function(){
     var fr = new FileReader();
     fr.onload= function(){
     pastingCode(fr.result);
     }
     fr.readAsText((<HTMLInputElement>document.getElementById('getFile')).files[0])
   })
 }

  public onClickDownload() {             
    var textFile = null,
    makeTextFile = function (text) {
      var data = new Blob([text], {type: 'text/plain'});
      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }
      textFile = window.URL.createObjectURL(data);
      return textFile;
    };
    var link= document.getElementById("downloadlink")
    link.setAttribute('href', makeTextFile(this.codeEditor.getValue()));
    link.click();
  }
}

interface RunResult {
  stdout: string;
  time: number;
  memory: number;
  compile_output: string;
  stderr: string;
  token: string;
  message: string;
  status: string;
}