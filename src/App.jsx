import Header from "./components/Header";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./components/Home";
import NewPost from "./components/NewPost";
import PostPage from "./components/PostPage";
import About from "./components/About";
import Missing from "./components/Missing";
import { Routes, useNavigate, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { format } from "date-fns";

function App() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchPosts() {
      try {
        const response = await fetch(
          "https://sever-posts.onrender.com/posts",
          signal
        );
        if (!response.ok) {
          const responseText = await response.text();
          throw new Error(`Something went wrong: ${responseText}`);
        }

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        if (error.name == "AbortError") {
          console.log("Fetch Aborted ");
        } else {
          console.error(error);
        }
      }
    }

    fetchPosts();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const filteredResults = posts.filter(
      (post) =>
        post.body.toLowerCase().includes(search.toLowerCase()) ||
        post.title.toLowerCase().includes(search.toLowerCase())
    );

    setSearchResults(filteredResults.reverse());
  }, [posts, search]);





  async function addItem() {
    e.preventDefault();
    const id = String(Date.now());
    const datetime = format(new Date(), "MMMM dd, yyyy pp");
    const newPosts = { id, title: postTitle, datetime, body: postBody };
    setPostTitle("");
    setPostBody("");
    navigate("/");

    const newPost = {
      id,
      title: postTitle,
      datetime,
      body: postBody
    };

    try {
      const response = await fetch("https://sever-posts.onrender.com/posts", {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify(newPost)
        
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok:${errorText}`)
      }
      const newPosts = [...posts, newPost];
      setPosts(newPosts)
     
    } catch (error) {
      console.error("Error creating new item", error.message)
    }
  }

  function handaleSubmit(e) {
    e.preventDefault();
    addItem();

  }

  async function handleDelete(id) {
    try {
      const postToDelete = posts.find((post) => post.id === id);
      if (!postToDelete) throw new Error("Deleted item not found");
  
      const response = await fetch(`https://sever-posts.onrender.com/posts/${id}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const textError = await response.text();
        throw new Error(`Response was not ok: ${textError}`);
      }
  
      const filteredPosts = posts.filter((post) => post.id !== id);
      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error deleting item", error.message);
    }
  }

  return (
    <div className="App">
      <Header title="React JS Blog" />
      <Nav search={search} setSearch={setSearch} />
      <Routes>
        <Route path="/" element={<Home posts={searchResults} />} />
        <Route
          path="/post"
          element={
            <NewPost
              handleSubmit={handaleSubmit}
              postTitle={postTitle}
              setPostTitle={setPostTitle}
              postBody={postBody}
              setPostBody={setPostBody}
            />
          }
        />
        <Route
          path="/post/:id"
          element={<PostPage posts={posts} handleDelete={handleDelete} />}
        />
        <Route path="/about" component={<About />} />
        <Route path="*" component={<Missing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;