package com.aifitness.userservice.Service;

import org.springframework.beans.factory.annotation.Autowired;
import com.aifitness.userservice.Repository.Repo;
import com.aifitness.userservice.Entity.Entity;
import java.util.List;
import com.aifitness.userservice.Enum.Goal;

@org.springframework.stereotype.Service
public class Service {

    @Autowired
    private Repo repo;

    public List<Entity> getAllUsers(){
        return repo.findAll();
    }

    public Entity getUserById(String id){
        return repo.findById(id).orElse(null);
    }

    public List<Entity> getByGoal(Goal goal){
        return repo.findByGoal(goal);
    }


}
