import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "react-hot-toast";
import { AuthContext } from "./../../../../contexts/UserProvider/UserProvider";
import moment from "moment/moment";
import { uploadFile } from "react-s3";
import { useQuery } from "@tanstack/react-query";
import ExercisesModal from "./ExercisesModal";

window.Buffer = window.Buffer || require("buffer").Buffer;
const config = {
  bucketName: "all-files-for-gog",
  dirName: "assets/any-types",
  region: "ap-south-1",
  accessKeyId: process.env.REACT_APP_S3AccessKeyId,
  secretAccessKey: process.env.REACT_APP_S3SecretAccessKey,
};

function AddAssignment() {
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, reset } = useForm();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [exercisesModal, setExercisesModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [exercisesId, setExercisesId] = useState([]);
  const [items, setItems] = useState([]);

  const {
    data: exercises = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await fetch(`http://localhost:5000/exerciseSearch`);
      const data = await res.json();

      if (data.success) {
        const result = exercises.data;
        setItems(result);
      } else {
        toast.error(data.message);
      }
      console.log(data);
      return data;
    },
  });

  const handelAddExerciseId = (id) => {
    setExercisesId([...exercisesId, id]);
  };

  const onSubmit = (data) => {
    setLoading(true);

    if (exercisesId.length === 0) {
      toast.error("Pleas Select Exercises");
      setLoading(false);
    }

    const justNow = moment().format();
    if (data?.fileInput[0]) {
      const file = data?.fileInput[0];
      console.log(file);
      uploadFile(file, config)
        .then((fileData) => {
          setUploadedFile(fileData.location);
          console.log("fileData", fileData);
        })
        .catch((err) => {
          toast.error(err.message);
          setLoading(false);
        });
    }

    const assignmentDetails = {
      assignmentName: data?.assignmentName,
      topic: data?.topic,
      additions: {
        instructions: data?.textArea,
        files: uploadedFile,
      },
      type: data?.type,
      exercises: exercisesId,
      actionsDetails: {
        isDeleted: false,
        creation: {
          createdAt: justNow,
          creatorEmail: user?.email,
        },

        updation: {
          updateAt: justNow,
          updatorEmail: user?.email,
        },
      },
    };

    console.log(assignmentDetails);

    fetch(`http://localhost:5000/assignmentDetails`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(assignmentDetails),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          toast.success(result.message);
          reset(data);
          setExercisesId([]);
        } else {
          toast.error(result.message);
        }
      })
      .catch((error) => {
        toast.error(error.message);
        setLoading(false);
      });
  };

  if (isLoading && exercises.length === 0) {
    return (
      <div style={{ marginTop: "800px" }} className='text-center '>
        <div className='spinner-grow text-center ' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className='py-20 px-10 bg-green-300 w-2/3 mx-auto my-16 rounded-xl font-poppins'>
      <form onSubmit={handleSubmit(onSubmit)} className='max-w-lg mx-auto'>
        <div className='mb-4'>
          <label
            htmlFor='assignmentName'
            className='block text-gray-700 font-bold mb-2'>
            Assignment Name
          </label>
          <input
            type='text'
            id='assignmentName'
            {...register("assignmentName")}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='topic' className='block text-gray-700 font-bold mb-2'>
            Topic
          </label>
          <input
            type='text'
            id='topic'
            {...register("topic")}
            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='textArea'
            className='block text-gray-700 font-bold mb-2'>
            <div className='flex items-center justify-between'>
              <p>Notes:</p>
              <p
                onClick={() => setInstructions(true)}
                className='hover:text-sky-500 hover:cursor-pointer'>
                Instructions
              </p>
            </div>
          </label>
          <textarea
            id='textArea'
            {...register("textArea")}
            className='shadow appearance-none border rounded w-full py-1 px-2 h-28 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            value={text}
            onChange={(e) => setText(e.target.value)}></textarea>
          <label
            onClick={() => setPreview(true)}
            className='font-poppins font-medium text-white px-4 py-2 bg-green-400 hover:bg-green-500 rounded-md'>
            Preview
          </label>
          {/* For Preview only */}
          {preview && (
            <>
              <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-[20010] outline-none focus:outline-none'>
                <div className='relative w-[360px] h-[600px] sm:w-[400px] md:w-[600px] lg-[700px]  py-2 sm:py-4 lg:py-4 px-2 sm:px-4 md:px-6 mx-auto max-w-3xl  bg-white rounded-lg shadow-2xl'>
                  <button
                    onClick={() => setPreview(false)}
                    className='absolute right-5 top-5 px-2 py-2 bg-red-400 rounded-full'>
                    ❌
                  </button>
                  <h3 className='text-2xl font-poppins font-medium mt-1'>
                    Preview:
                  </h3>
                  <div className=' mt-6 w-full h-4/5 p-4 mx-auto bg-white border border-green-400 rounded-md overflow-x-auto overflow-y-auto'>
                    <ReactMarkdown
                      children={text}
                      remarkPlugins={[remarkGfm]}></ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className='opacity-25 fixed inset-0  z-[20000] bg-black'></div>
            </>
          )}
          {/* For Instructions to teachers to write markdown */}
          {instructions && (
            <>
              <div className='justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-[20010] outline-none focus:outline-none'>
                <div className='relative w-[360px] h-[600px] sm:w-[400px] md:w-[600px] lg-[700px]  py-2 sm:py-4 lg:py-4 px-2 sm:px-4 md:px-6 mx-auto max-w-3xl  bg-white rounded-lg shadow-2xl'>
                  <label
                    onClick={() => setInstructions(false)}
                    className='absolute right-5 top-5 px-2 py-2 bg-red-400 rounded-full'>
                    ❌
                  </label>
                  <h3 className='text-2xl font-poppins font-medium mt-1'>
                    Instructions:
                  </h3>
                  <iframe
                    title='markdown instructions'
                    src='https://padomi.id.lv/PRG/par__/Markdown-Cheat-Sheet.pdf'
                    width='100%'
                    height='500px'></iframe>
                </div>
              </div>
              <div className='opacity-25 fixed inset-0  z-[20000] bg-black'></div>
            </>
          )}
        </div>
        <div className='mb-6'>
          <div class='max-w-2xl mx-auto'>
            <label
              class='block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300'
              for='file_input'>
              Upload file
            </label>
            <input
              class='block w-full text-sm text-green-400 border border-gray-300 rounded-lg cursor-pointer bg-green-50 focus:outline-none'
              id='file_input'
              {...register("fileInput")}
              type='file'
            />
          </div>
        </div>
        <div className='mb-4'>
          <label htmlFor='type' className='block text-gray-700 font-bold mb-2'>
            Type
          </label>
          <select
            id='type'
            {...register("type")}
            className=' shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'>
            <option value='project'>project</option>
            <option value='evaluation'>evaluation</option>
            <option value='assignments'>Assignments</option>
          </select>
        </div>
        <div className='mb-4'>
          <label
            onClick={() => setExercisesModal(true)}
            className='font-poppins font-medium text-white px-4 py-2 bg-green-400 hover:bg-green-500 rounded-md'>
            Select Exercises
          </label>
          {exercisesModal && (
            <ExercisesModal
              setExercisesModal={setExercisesModal}
              handelAddExerciseId={handelAddExerciseId}
              items={items}
            />
          )}
        </div>

        <button
          type='submit'
          className='w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
          {loading ? "Loading" : "Submit"}
        </button>
      </form>
    </div>
  );
}

export default AddAssignment;
