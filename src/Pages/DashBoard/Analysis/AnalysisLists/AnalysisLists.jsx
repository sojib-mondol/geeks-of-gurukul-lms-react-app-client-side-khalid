import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../../contexts/UserProvider/UserProvider";
import EachRes from "./EachRes/EachRes";

const AnalysisLists = () => {
  const [responses, setResponses] = useState([]);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    fetch(
      `https://geeks-of-gurukul-server-side.vercel.app/assessment-responses?email=${user?.email}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("data: ", data);
        setResponses(data);
      });
  }, [user]);
  return (
    <div className="w-4/5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4 px-5">
      {responses?.length > 0 ? (
        responses?.map((response) => (
          <EachRes key={response?._id} response={response} />
        ))
      ) : (
        <div className="w-full h-full justify-center items-center text-2xl font-bold">
          <h1 className="">you have not attempted any assessment </h1>
        </div>
      )}
    </div>
  );
};

export default AnalysisLists;
