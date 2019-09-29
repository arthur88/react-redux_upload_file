import { useCallback, useReducer, useEffect, useRef } from "react";

//Constants
const LOADED = "LOADED";
const INIT = "INIT";
const PENDING = "PENDING";
const FILES_UPLOADED = "FILES_UPLOADED";
const UPLOAD_ERROR = "UPLOAD_ERROR";

/*
files is where the user initially loads an array of files by selecting them from the file input.

pending will be used to let the UI know what file is currently being processed and how many files are left over.

next will be assigned the next item in the pending array when the code detects that it's ready to do so.

uploading will be used for the code to know that files are still being uploaded.

uploaded will be the object we insert files into as soon as they are done uploading.

And finally, status is provided as extra convenience mainly for the user interface to utilize to its advantage.
*/
const initialState = {
  files: [],
  pending: [],
  next: null,
  uploading: false,
  uploaded: {},
  status: "idle"
};

//define the reducer
//switch case into the reduce
const reducer = (state, action) => {
  switch (action.type) {
    case "load":
      return { ...state, files: action.files, status: LOADED };
    case "submit":
      return { ...state, uploading: true, pending: state.files, status: INIT };
    case "next":
      return {
        ...state,
        next: action.next,
        status: PENDING
      };

    //reset next back to null so that the first useEffect can respond to it again. When it does, it will pull in the next file in the state.pending queue and assign that to the next state.next value.
    //
    case "file-uploaded":
      return {
        ...state,
        next: null,
        pending: action.pending,
        uploaded: {
          ...state.uploaded,
          [action.prev.id]: action.prev.file
        }
      };
    case "files-uploaded":
      return { ...state, uploading: false, status: FILES_UPLOADED };
    case "set-upload-error":
      return { ...state, uploadError: action.error, status: UPLOAD_ERROR };
    default:
      return state;
  }
};

//mock function to simulate an "upload" promise handler
const api = {
  uploadFile({ timeout = 550 }) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  }
};

const logUploadedFile = (num, color = "green") => {
  const msg = `%cUploaded ${num} files.`;
  const style = `color:${color};font-weight:bold;`;
  console.log(msg, style);
};

//onChange handler pass files into the state as soon as it call
//state/dispatch api into the hook
const useFileHandlers = () => {
  const countRef = useRef(0);

  const [state, dispatch] = useReducer(reducer, initialState);

  const onChange = e => {
    if (e.target.files.length) {
      console.log(e.target.files);

      const arrFiles = Array.from(e.target.files);
      const files = arrFiles.map((file, index) => {
        const src = window.URL.createObjectURL(file);
        return { file, id: index, src };
      });

      //chamnge state - only one way
      dispatch({ type: "load", files });
    }
  };

  //useCallback - obtain latest state
  const onSubmit = useCallback(
    e => {
      e.preventDefault();
      if (state.files.length) {
        dispatch({ type: "submit" });
      } else {
        window.alert("You don't have any files loaded.");
      }
    },
    [state.files.length]
  );
  //next file to be uploaded as soon it detect that isready to upload
  //It grabs the next available file in the state.pending array and creates a signal using dispatch, sending the file as the next state.next object
  useEffect(() => {
    if (state.pending.length && state.next == null) {
      const next = state.pending[0];
      dispatch({ type: "next", next });
    }
  }, [state.next, state.pending]);

  // uploading the next file that was just set in the state
  useEffect(() => {
    if (state.pending.length && state.next) {
      const { next } = state;
      api
        .uploadFile(next)
        .then(() => {
          const prev = next;
          logUploadedFile(++countRef.current);
          const pending = state.pending.slice(1);
          dispatch({ type: "file-uploaded", prev, pending });
        })
        .catch(error => {
          console.error(error);
          dispatch({ type: "set-upload-error", error });
        });
    }
  }, [state]);

  //  end the upload proccess
  useEffect(() => {
    if (!state.pending.length && state.uploading) {
      dispatch({ type: "files-uploaded" });
    }
  }, [state.pending.length, state.uploading]);

  return {
    ...state,
    onSubmit,
    onChange
  };
};

export default useFileHandlers;
