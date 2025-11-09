import { useState } from 'react'


function App() {
  const [value, setValue] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setValue(p => {
      return {
        ...p,
        [e.target.name]: e.target.value
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (value.password && value.username) {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          
          'content-type': "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          username: value.username,
          password: value.password
        })
      });
     
     await res.json();
      let resp = await fetch("http://localhost:3000/profile", {
        credentials: 'include'
      });
      resp = await resp.json();
      alert(JSON.stringify(resp));
    }
    else {
      alert('please enter the details to submit');
    }
  }

  return (
    <>
      <form>
        <label for="username" />
        <input name="username" value={value.username} onChange={handleChange} />
        <label for="password" />
        <input name="password" value={value.password} onChange={handleChange} />
        <button type='submit' onClick={handleSubmit}>Login</button>
      </form>
    </>
  )
}

export default App
