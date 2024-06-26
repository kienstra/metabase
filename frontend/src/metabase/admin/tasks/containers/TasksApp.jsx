/* eslint-disable react/prop-types */
import cx from "classnames";
import { Component } from "react";
import { t } from "ttag";
import _ from "underscore";

import AdminHeader from "metabase/components/AdminHeader";
import PaginationControls from "metabase/components/PaginationControls";
import Link from "metabase/core/components/Link";
import Tooltip from "metabase/core/components/Tooltip";
import AdminS from "metabase/css/admin.module.css";
import CS from "metabase/css/core/index.css";
import Database from "metabase/entities/databases";
import Task from "metabase/entities/tasks";

import {
  InfoIcon,
  SectionControls,
  SectionHeader,
  SectionRoot,
  SectionTitle,
} from "./TasksApp.styled";

// Please preserve the following 2 @ calls in this order.
// Otherwise @Database.loadList overrides pagination props
// that come from @Task.LoadList

class TasksAppInner extends Component {
  render() {
    const {
      tasks,
      databases,
      page,
      pageSize,
      onNextPage,
      onPreviousPage,
      children,
    } = this.props;
    const databaseByID = {};
    // index databases by id for lookup
    for (const db of databases) {
      databaseByID[db.id] = db;
    }
    return (
      <SectionRoot>
        <SectionHeader>
          <SectionTitle>
            <AdminHeader title={t`Troubleshooting logs`} />
            <Tooltip
              tooltip={t`Trying to get to the bottom of something? This section shows logs of Metabase's background tasks, which can help shed light on what's going on.`}
            >
              <InfoIcon name="info" />
            </Tooltip>
          </SectionTitle>
          <SectionControls>
            <PaginationControls
              onPreviousPage={onPreviousPage}
              onNextPage={onNextPage}
              page={page}
              pageSize={pageSize}
              itemsLength={tasks.length}
            />
          </SectionControls>
        </SectionHeader>

        <table className={cx(AdminS.ContentTable, CS.mt2)}>
          <thead>
            <tr>
              <th>{t`Task`}</th>
              <th>{t`DB Name`}</th>
              <th>{t`DB Engine`}</th>
              <th>{t`Started at`}</th>
              <th>{t`Ended at`}</th>
              <th>{t`Duration (ms)`}</th>
              <th>{t`Details`}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const db = task.db_id ? databaseByID[task.db_id] : null;
              const name = db ? db.name : null;
              const engine = db ? db.engine : null;
              // only want unknown if there is a db on the task and we don't have info
              return (
                <tr key={task.id}>
                  <td className="text-bold">{task.task}</td>
                  <td>{task.db_id ? name || t`Unknown name` : null}</td>
                  <td>{task.db_id ? engine || t`Unknown engine` : null}</td>
                  <td>{task.started_at}</td>
                  <td>{task.ended_at}</td>
                  <td>{task.duration}</td>
                  <td>
                    <Link
                      className="link text-bold"
                      to={`/admin/troubleshooting/tasks/${task.id}`}
                    >{t`View`}</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {
          // render 'children' so that the invididual task modals show up
          children
        }
      </SectionRoot>
    );
  }
}

const TasksApp = _.compose(
  Database.loadList(),
  Task.loadList({
    pageSize: 50,
  }),
)(TasksAppInner);

export default TasksApp;
