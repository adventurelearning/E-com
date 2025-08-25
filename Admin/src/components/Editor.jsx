// // components/Editor.js
// import React, { useRef } from "react";
// import { Editor } from "@tinymce/tinymce-react";

// const TinyEditor = ({ value, onChange, height = 700, onImageUpload }) => {
//   const editorRef = useRef(null);

//   return (
//     <Editor
//       apiKey="qrq67atiaw9jrlvphtkwrxmq30ivmvnzg7v0c9j096ifhex6"
//       value={value}
//       onEditorChange={onChange}
//       onInit={(evt, editor) => (editorRef.current = editor)}
//       init={{
//         height,
//         menubar: true,
//         branding: false,
//         browser_spellcheck: true,
//         image_advtab: true,
//         image_caption: true,
//         image_title: true,
//         image_dimensions: false,
//         image_description: true,
//         images_reuse_filename: true,
//         paste_data_images: true,
//         automatic_uploads: true,
//         toolbar_mode: "sliding",
//         contextmenu: "link image table spellchecker",

//         plugins: [
//           "advlist", "autolink", "lists", "link", "image", "charmap", "preview", "anchor",
//           "searchreplace", "visualblocks", "code", "fullscreen",
//           "insertdatetime", "media", "table", "paste", "help", "wordcount",
//           "emoticons", "autoresize", "codesample",
//           "print", "directionality", "template",
//           "visualchars", "pagebreak", "nonbreaking",
//           "textpattern", "textcolor"
//         ],

//         toolbar: [
//           "undo redo | formatselect | fontselect | fontsizeselect | styleselect",
//           "bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify",
//           "bullist numlist outdent indent | link image media | table tabledelete | tableprops tablerowprops tablecellprops | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
//           "charmap emoticons codesample | preview fullscreen print | ltr rtl | pagebreak nonbreaking",
//           "removeformat | help"
//         ].join(" | "),

//         style_formats: [
//           { title: "Headings", items: [
//             { title: "Heading 1", format: "h1" },
//             { title: "Heading 2", format: "h2" },
//             { title: "Heading 3", format: "h3" },
//             { title: "Heading 4", format: "h4" }
//           ]},
//           { title: "Inline", items: [
//             { title: "Bold", icon: "bold", format: "bold" },
//             { title: "Italic", icon: "italic", format: "italic" },
//             { title: "Underline", icon: "underline", format: "underline" },
//             { title: "Strikethrough", icon: "strikethrough", format: "strikethrough" }
//           ]},
//           { title: "Blocks", items: [
//             { title: "Paragraph", format: "p" },
//             { title: "Blockquote", format: "blockquote" },
//             { title: "Div", format: "div" },
//             { title: "Pre", format: "pre" }
//           ]},
//           { title: "Alignment", items: [
//             { title: "Left", icon: "alignleft", format: "alignleft" },
//             { title: "Center", icon: "aligncenter", format: "aligncenter" },
//             { title: "Right", icon: "alignright", format: "alignright" },
//             { title: "Justify", icon: "alignjustify", format: "alignjustify" }
//           ]}
//         ],

//         textpattern_patterns: [
//           { start: "*", end: "*", format: "italic" },
//           { start: "**", end: "**", format: "bold" },
//           { start: "#", format: "h1" },
//           { start: "##", format: "h2" },
//           { start: "###", format: "h3" },
//           { start: "####", format: "h4" },
//           { start: "```", end: "```", format: "code" }
//         ],

//         templates: [
//           { title: "Two Columns", description: "Split content in two columns", content: '<div class="row"><div class="col-md-6">Column 1</div><div class="col-md-6">Column 2</div></div>' },
//           { title: "Callout Box", description: "Highlighted information box", content: '<div class="alert alert-info"><p>Important information</p></div>' }
//         ],

//         file_picker_types: "image",
//         file_picker_callback: (cb, value, meta) => {
//           if (meta.filetype === "image") {
//             const input = document.createElement("input");
//             input.type = "file";
//             input.accept = "image/*";
//             input.onchange = function () {
//               const file = this.files[0];
//               const reader = new FileReader();
//               reader.onload = function () {
//                 const id = "blobid" + new Date().getTime();
//                 const blobCache = editorRef.current.editorUpload.blobCache;
//                 const base64 = reader.result.split(",")[1];
//                 const blobInfo = blobCache.create(id, file, base64);
//                 blobCache.add(blobInfo);
//                 cb(blobInfo.blobUri(), { title: file.name });
//               };
//               reader.readAsDataURL(file);
//             };
//             input.click();
//           }
//         },

//         images_upload_handler: async (blobInfo, progress) => new Promise((resolve, reject) => {
//           if (typeof onImageUpload === "function") {
//             // Generate unique filename
//             const filename = `editor-${Date.now()}-${blobInfo.filename()}`;
            
//             onImageUpload(blobInfo.blob(), filename)
//               .then(url => resolve(url))
//               .catch(err => {
//                 console.error("Image upload failed:", err);
//                 reject("Image upload failed");
//               });
//             return;
//           }
//           // Fallback to local URL if no upload function provided
//           resolve(URL.createObjectURL(blobInfo.blob()));
//         }),

//         content_css: "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
//         content_style:
//           "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; } " +
//           "img { max-width: 100%; height: auto; } " +
//           "table { width: 100%; border-collapse: collapse; margin: 10px 0; } " +
//           "table, th, td { border: 1px solid #ddd; padding: 8px; } " +
//           "th { background-color: #f2f2f2; } " +
//           "blockquote { border-left: 3px solid #ccc; margin: 10px 0; padding-left: 15px; font-style: italic; } " +
//           "code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; } " +
//           "pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; } " +
//           ".alert { padding: 15px; margin-bottom: 20px; border: 1px solid transparent; border-radius: 4px; } " +
//           ".alert-info { color: #31708f; background-color: #d9edf7; border-color: #bce8f1; }",

//         a11y_advanced_options: true,
//         autoresize_bottom_margin: 20,
//         help_tabs: ["shortcuts", "keyboardnav"],

//         setup: (editor) => {
//           editor.on("init", () => {
//             if (value) {
//               editor.setContent(value);
//             }
//           });
//           editor.addShortcut("Meta+S", "Save content", () => {
//             console.log("Editor content saved");
//           });
//         }
//       }}
//     />
//   );
// };

// export default TinyEditor;
// components/TinyEditor.js
import React, { useEffect, useRef, memo } from "react";

const TinyEditor = ({ value, onChange, height = 400 }) => {
  const editorRef = useRef(null); // holds TinyMCE editor instance
  const divRef = useRef(null);    // holds the DOM element for target

  useEffect(() => {
    // Ensure TinyMCE is available
    if (window.tinymce && divRef.current) {
      window.tinymce.init({
        target: divRef.current,
        height,
        menubar: true,
        branding: false,
        browser_spellcheck: true,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table paste help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline backcolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image | removeformat | help",

        setup: (editor) => {
          editorRef.current = editor;

          // Set initial value
          editor.on("init", () => {
            if (value) {
              editor.setContent(value);
            }
          });

          // Emit changes
          editor.on("Change KeyUp", () => {
            onChange(editor.getContent());
          });
        },

        content_style: `
          body { font-family: Arial, sans-serif; font-size:14px; }
          img { max-width: 100%; height: auto; }
        `,
      });

      return () => {
        if (editorRef.current) {
          window.tinymce.remove(editorRef.current);
          editorRef.current = null;
        }
      };
    }
  }, [onChange, height]);

  // Sync value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getContent()) {
      editorRef.current.setContent(value || "");
    }
  }, [value]);

  return <div ref={divRef}></div>;
};

export default memo(TinyEditor);
