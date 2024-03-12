async function deleteFormHandler(event){
    const post_id = event.target.dataset.id;
    const response = await fetch(`/api/posts/${post_id}`, {method: 'DELETE'});
    if (response.ok) {
        document.location.replace('/dashboard');
      } else {
        alert(response.statusText);
      } 
}

document.querySelector('button.delete-post-btn').addEventListener('click', deleteFormHandler);
