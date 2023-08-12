import { KeyboardEvent, ChangeEvent, useState, useEffect, useContext } from "react";
import { Button, Form, Table } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FloatingWrapper } from "../../components/FloatingWrapper";
import "./ProjectAccess.css";
import { AiOutlineArrowLeft } from "react-icons/ai";
import InviteProMemModal from "../../components/Modal/InviteProMemModal";
import { GetProjectMembers, GetProjectDetail } from "../../service/projects/projects.service";
import RemoveProMemModal from "../../components/Modal/RemoveProMemModal";
import { AuthenticationContext } from "../../service/authentication/authentication.context";

export const ProjectAccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [membersUpdated, setMembersUpdated] = useState(false);

  const { userToken } = useContext(AuthenticationContext);
  const [teamPk, projectPk] = location.pathname.split("/").slice(1, 3);
  const [projectDetails, setProjectDetails] = useState(null);
  const projectName = projectDetails ? projectDetails.name : "";

  const handleSearchChange = (e) => {
    // 타입 지정
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    // 타입 지정
    if (e.key === "Enter") {
      // 검색 로직
      const results = [
        { name: "홍길동", email: "hong@example.com" },
        { name: "김철수", email: "kim@example.com" },
      ];
      setSearchResults(results);
    }
  };

  const handleMemberAdded = () => {
    setMembersUpdated(!membersUpdated);
  };

  const handleMemberRemoved = () => {
    setMembersUpdated(!membersUpdated);
  };

  useEffect(() => {
    // 프로젝트 세부 정보를 가져오는 로직
    GetProjectDetail(projectPk, userToken)
      .then((res) => {
        setProjectDetails(res.data.data); // 응답 데이터에서 프로젝트 세부 정보를 가져옵니다.
      })
      .catch((err) => {
        console.error(err);
        alert("프로젝트 정보를 제대로 불러오지 못했습니다");
      });
  }, [projectPk, userToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetProjectMembers(projectPk, "", 0, 10, userToken);
        const userPks = response.data.data.content.map((member) => member);
        setProjectMembers(userPks);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [projectPk, membersUpdated]); // projectPk, 멤버가 변경될 때마다

  return (
    <div className="ProjectAccess">
      <FloatingWrapper width="250px" height="80vh" padding="2%">
        <div className="title">Project Setting</div>

        <div className="projectNameWrapper">
          <div className="icon"></div>
          <h2>{location.state.name}</h2>
        </div>
        <div className="prevPageWrapper">
          <AiOutlineArrowLeft className="arrow" size={24} />
          <div>전체 프로젝트</div>
        </div>

        <h5 className="leftMenuItem" onClick={() => navigate(`/${teamPk}/${projectPk}/projectSetting/`, { state: location.state })}>
          세부 사항
        </h5>
        <h5 className="leftMenuItem" onClick={() => navigate(`/${teamPk}/${projectPk}/projectAccess/`, { state: location.state })}>
          액세스
        </h5>
      </FloatingWrapper>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <FloatingWrapper style={{ width: "600px", display: "flex", alignItems: "center", justifyContent: "center" }} padding="6%">
          <div className="ProjectAccess-header">
            <h2 className="ProjectAccess-header-title">액세스</h2>
            <div className="button-group">
              <Button className="delete-button" variant="outline-danger" type="submit" onClick={() => setShowRemoveModal(true)}>
                사용자 삭제
              </Button>
              <Button className="add-button" variant="outline-success" type="submit" onClick={() => setShowAddModal(true)}>
                사용자 추가
              </Button>
            </div>
          </div>

          <div className="ProjectAccess-body">
            <div className="ProjectAccess-body-title">프로젝트 멤버</div>
            <div className="ProjectMember-search">
              <input
                className="searchbar"
                type="text"
                placeholder="이름, 이메일 주소를 검색"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
              />
            </div>

            <div className="ProjectMember-list">
              <Table striped bordered hover>
                {/* <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, index) => (
                    <tr key={index}>
                      <td>{result.name}</td>
                      <td>{result.email}</td>
                    </tr>
                  ))}
                </tbody> */}
                <thead>
                  <tr>
                    <th>이름 (유저 pk)</th>
                    <th>이메일</th>
                  </tr>
                </thead>
                <tbody>
                  {projectMembers.map((memberPk, index) => (
                    <tr key={index}>
                      <td>{memberPk}</td>
                      <td></td> {/* 이메일 칸은 비워둠 */}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </FloatingWrapper>
        <InviteProMemModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          projectPk={projectPk}
          projectName={projectName}
          onMemberAdded={handleMemberAdded}
          userToken={userToken}
        />
        <RemoveProMemModal
          show={showRemoveModal}
          onHide={() => setShowRemoveModal(false)}
          projectPk={projectPk}
          projectName={projectName}
          onMemberRemoved={handleMemberRemoved}
          userToken={userToken}
        />
      </div>
    </div>
  );
};
