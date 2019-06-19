import React, { Component } from "react";
import axios from "axios";

import algorithmia from "algorithmia";

class ImageUploader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
      imageUrl: null,
      floorUrl: null,
      filter: null,
      detectedFloors: null,
      uploadedImages: null
    };
  }

  uploadHandler = e => {
    e.preventDefault();
    console.log("image", this.state.image);
    let formData = new FormData();

    formData.append("image", this.state.image);
    axios
      .post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      .then(res => this.setState({ floorUrl: res.data.imageUrl }))
      .catch(err => console.log(err));
  };

  onChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  onSubmit = e => {
    e.preventDefault();
    let input = { file: this.state.floorUrl, floor_only: this.state.filter };

    axios
      .post("http://localhost:5000/floordetection", input)
      .then(response =>
        this.setState(
          {
            detectedFloors: response.data.result
          },
          () => {
            console.log(this.state.detectedFloors);
          }
        )
      )
      .catch(err => console.log(err));
  };

  imageHandler = e => {
    this.setState({
      image: e.target.files[0]
    });
  };

  uploadedImagesHandler = () => {
    axios.get("http://localhost:5000/listUploadedImages").then(res => {
      
      this.setState({
        uploadedImages: res.data
      });
    });
  };

  render() {
    let floorImages = this.state.detectedFloors
      ? this.state.detectedFloors.map(url => {
          return (
            <img
              src={url}
              alt=""
              key={url}
              style={{
                width: 200,
                height: 200,
                paddingLeft: 20,
                paddingTop: 20
              }}
            />
          );
        })
      : false;

    let uploadedImages = this.state.uploadedImages
      ? this.state.uploadedImages.map(image => {
          return (
            <img
              src={image.url}
              alt=""
              key={image}
              style={{
                width: 200,
                height: 200,
                paddingLeft: 20,
                paddingTop: 20
              }}
            />
          );
        })
      : false;

    return (
      <div>
        <p>Insert Image</p>
        <input type="file" onChange={this.imageHandler} name="image" />
        <button onClick={this.uploadHandler}>Upload</button>
        <button onClick={this.uploadedImagesHandler} style={{marginLeft:30}}>
          List uploaded images
        </button>
        <div style={{ marginTop: 50 }}>
          {this.state.floorUrl ? (
            <div style={{ marginTop:30 }}>
              <div>Image you uploaded</div>{" "}
              <img src={this.state.floorUrl} alt="" style={{marginTop: 30}}/>{" "}
              <div style={{ marginTop:20 }}>
                <form onSubmit={this.onSubmit}>
                  <input
                    type="radio"
                    name="filter"
                    value={true}
                    onChange={this.onChange}
                  />
                  Foor Only
                  <input
                    type="radio"
                    name="filter"
                    value={false}
                    onChange={this.onChange}
                  />
                  Whole Room
                  <div>
                    <button type="submit">Detect Floors</button>
                  </div>
                </form>
              </div>
              <div />
            </div>
          ) : null}
        </div>

        <div style={{marginTop: 50}}> 
          {floorImages ? (
            <div style={{ paddingTop: 30 }}>
              <div>
                <h4>Detected floors </h4>
              </div>{" "}
              {floorImages}{" "}
            </div>
          ) : null}
        </div>

        <div style={{marginTop: 50}}>
          {this.state.uploadedImages ? (
            <div>
              {" "}
              <div>Uploaded Images</div> <div>{uploadedImages}</div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }
}

export default ImageUploader;
