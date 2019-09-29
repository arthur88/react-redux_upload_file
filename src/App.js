import React from "react";

import useFileHandlers from "./useFileHandlers";

const Input = props => (
  <input
    type="file"
    accept="image/*"
    name="img-loader-input"
    multiple
    {...props}
  />
);

// import the useFileHandlers hook and use it in the component. We'll also make the UI map over each file and render them as thumbnails
const App = () => {
  const {
    files,
    pending,
    next,
    uploading,
    uploaded,
    status,
    onSubmit,
    onChange
  } = useFileHandlers();

  return (
    <div className="container">
      <form className="form" onSubmit={onSubmit}>
        {status === "FILES_UPLOADED" && (
          <div className="success-container">
            <div>
              <h2>Congratulations!</h2>
              <small>You uploaded your files. Get some rest.</small>
            </div>
          </div>
        )}
        <div>
          <Input onChange={onChange} />
          <button type="submit">Submit</button>
        </div>
        <p>
          onChage - get files an assing to array, dispatch to redu with state
          load and all files
        </p>
        <p>
          onSubmit - call <i>submit</i>state{" "}
        </p>
        <p>useeffect is calling to initial state next</p>
        <p>
          then another use effect to upload file, after uploading state then use
          uploaded state that mark that all files uploaded and then
          file-uploaded
        </p>
        <div>
          {files.map(({ file, src, id }, index) => (
            <div
              style={{
                opacity: uploaded[id] ? 0.2 : 1
              }}
              key={`thumb${index}`}
              className="thumbnail-wrapper"
            >
              <img className="thumbnail" src={src} alt="" />
              <div className="thumbnail-caption">{file.name}</div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default App;
